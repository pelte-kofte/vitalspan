#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import {
  DEFAULT_COVER_CONCEPT_BOUNDARIES,
  generateAnthropicCoverMetaphorCandidates,
} from '../supabase/functions/_shared/briefCoverConcept.ts'
import {
  generateAnthropicVisualDirection,
  selectConceptFromPhase4AResult,
} from '../supabase/functions/_shared/briefCoverDirection.ts'
import {
  assertEditorialDistinctiveness,
  reviewEditorialDistinctiveness,
} from '../supabase/functions/_shared/briefCoverEditorialDistinctiveness.ts'
import { compileGptImage2CoverPrompt } from '../supabase/functions/_shared/briefCoverPromptCompiler.ts'

const args = process.argv.slice(2)
const command = args.shift()

function option(name, required = false) {
  const index = args.indexOf(`--${name}`)
  const next = index >= 0 ? args[index + 1] : undefined
  const value = next && !next.startsWith('--') ? next : undefined
  if (required && !value) throw new Error(`Missing --${name}`)
  return value
}

function positional(index, label) {
  const values = args.filter((value, position) => position === 0 || !args[position - 1].startsWith('--'))
    .filter((value) => !value.startsWith('--'))
  if (!values[index]) throw new Error(`Missing ${label}`)
  return values[index]
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function documentVersion(content, fallback) {
  return content.match(/^Version:\s*([^\n]+)$/mi)?.[1]?.trim() ?? fallback
}

async function readPhase4aResult(candidateFile, candidateJson) {
  if (candidateJson) return JSON.parse(candidateJson)
  if (candidateFile) return JSON.parse(await readFile(candidateFile, 'utf8'))
  if (process.stdin.isTTY) {
    throw new Error('Pipe a Phase 4A result on stdin or provide --candidate-file or --candidate-json')
  }
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  if (!raw.trim()) throw new Error('Phase 4A candidate input is empty')
  return JSON.parse(raw)
}

function usage() {
  process.stdout.write(`The Vitalspan Brief admin CLI

Required environment:
  EXPO_PUBLIC_SUPABASE_URL
  EXPO_PUBLIC_SUPABASE_ANON_KEY
  BRIEF_ADMIN_ACCESS_TOKEN  short-lived JWT for an app_metadata admin
    OR BRIEF_ADMIN_EMAIL + BRIEF_ADMIN_PASSWORD

Commands:
  npm run brief:admin -- candidates [--status new]
  npm run brief:admin -- drafts [--status ready_for_review]
  npm run brief:admin -- show <draft-id>
  npm run brief:admin -- jobs
  npm run brief:admin -- review-candidate <candidate-id> --status approved|rejected|shortlisted
  npm run brief:admin -- edit-candidate <candidate-id> --headline "..." --summary "..." --takeaway "..." --limitations "..." --evidence "Moderate"
  npm run brief:admin -- edit-draft <draft-id> --cover <candidate-id> --order <id,id,id,id[,id]> --title "..." --note "..."
  npm run brief:admin -- backfill-issue-one-intelligence <draft-id>
  npm run brief:admin -- review-draft <draft-id> --status draft|ready_for_review|approved|rejected
  npm run brief:admin -- generate-cover-concepts <draft-id>
  npm run brief:admin -- generate-cover-direction <draft-id> --concept <conceptId> [--candidate-file <phase4a-result.json>]
  npm run brief:admin -- compile-cover-prompt <draft-id> --concept <conceptId> --direction-file <phase4b-result.json>
  npm run brief:admin -- generate-cover <draft-id>
  npm run brief:admin -- inspect-cover <draft-id>
  npm run brief:admin -- approve-cover <draft-id>
  npm run brief:admin -- reject-cover <draft-id> --reason "..."
  npm run brief:admin -- regenerate-cover <draft-id>
  npm run brief:admin -- publish <draft-id> --confirm publish
`)
}

async function invokeCoverPipeline(url, draftId) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const pipelineSecret = process.env.BRIEF_PIPELINE_SECRET
  if (!serviceRoleKey || !pipelineSecret) {
    throw new Error('generate-cover requires server-side SUPABASE_SERVICE_ROLE_KEY and BRIEF_PIPELINE_SECRET environment configuration')
  }
  const response = await fetch(`${url}/functions/v1/brief-cover`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      'x-brief-pipeline-secret': pipelineSecret,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ draftId }),
  })
  if (!response.ok) throw new Error(`brief-cover service failed with HTTP ${response.status}`)
  return response.json()
}

async function main() {
  if (!command || command === 'help' || command === '--help') {
    usage()
    return
  }
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const token = process.env.BRIEF_ADMIN_ACCESS_TOKEN
  const email = process.env.BRIEF_ADMIN_EMAIL
  const password = process.env.BRIEF_ADMIN_PASSWORD
  if (!url || !anonKey || (!token && (!email || !password))) {
    throw new Error('Missing Supabase URL/anon key and admin token or email/password')
  }
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  })
  if (!token) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(`Admin sign-in failed: ${error.message}`)
  }

  const checked = async (promise) => {
    const { data, error } = await promise
    if (error) throw new Error(error.message)
    return data
  }

  if (command === 'generate-cover-concepts') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for cover concept generation')
    const draftId = positional(0, 'draft id')
    const draft = await checked(supabase.from('editorial_drafts')
      .select('id,status,candidate_ids,cover_candidate_id')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    if (!Array.isArray(draft.candidate_ids) || draft.candidate_ids.length !== 5) {
      throw new Error('Cover-story evaluation requires exactly five selected articles')
    }
    const rows = await checked(supabase.from('article_candidates')
      .select('id,title,journal,publication_date,abstract,study_type,evidence_label,limitations,evidence_score,relevance_score,novelty_score,ai_summary')
      .in('id', draft.candidate_ids))
    const byId = new Map(rows.map((article) => [article.id, article]))
    const articles = draft.candidate_ids.map((id) => {
      const article = byId.get(id)
      if (!article) throw new Error(`Selected article ${id} is unavailable`)
      return {
        candidateId: article.id,
        title: article.title,
        journal: article.journal,
        publicationDate: article.publication_date,
        sourcePhrase: article.ai_summary || article.title,
        abstract: article.abstract,
        studyType: article.study_type,
        evidenceLabel: article.evidence_label,
        limitations: article.limitations,
        evidenceScore: article.evidence_score,
        relevanceScore: article.relevance_score,
        noveltyScore: article.novelty_score,
      }
    })
    const result = await generateAnthropicCoverMetaphorCandidates({
      articles,
      deterministicCoverArticleId: draft.cover_candidate_id,
      claimsNotImply: [...DEFAULT_COVER_CONCEPT_BOUNDARIES],
    }, apiKey, fetch, process.env.BRIEF_AI_MODEL)
    print({
      draftId,
      phase: '4A',
      persisted: false,
      downstreamInvoked: false,
      deterministicCoverArticleId: draft.cover_candidate_id,
      coverStory: result.coverStory,
      concepts: result.concepts,
      strongestTwo: result.strongestTwo,
      selectedConceptId: 'concept-1',
      selectedConcept: result.selectedConcept,
    })
    return
  }

  if (command === 'generate-cover-direction') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for visual direction generation')
    const draftId = positional(0, 'draft id')
    const conceptId = option('concept') ?? option('candidate', true)
    const candidateFile = option('candidate-file')
    const candidateJson = option('candidate-json')
    const phase4aResult = await readPhase4aResult(candidateFile, candidateJson)
    const { coverStory, selectedConcept } = selectConceptFromPhase4AResult(conceptId, phase4aResult)
    const draft = await checked(supabase.from('editorial_drafts')
      .select('id,status')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    const previousRows = await checked(supabase.from('editorial_cover_generations')
      .select('id,composition_family,physical_world,central_tension,hero_description,created_at')
      .eq('status', 'approved')
      .neq('draft_id', draftId)
      .order('created_at', { ascending: false })
      .limit(8))
    const [artBibleContent, foundingCoverDnaContent] = await Promise.all([
      readFile('.claude/VITALSPAN_ART_BIBLE.md', 'utf8'),
      readFile('.claude/FOUNDING_COVER_DNA.md', 'utf8'),
    ])
    const result = await generateAnthropicVisualDirection({
      coverStory,
      selectedConcept,
      artBible: {
        version: documentVersion(artBibleContent, 'current'),
        content: artBibleContent,
      },
      foundingCoverDna: {
        version: documentVersion(foundingCoverDnaContent, 'current'),
        content: foundingCoverDnaContent,
      },
      previousCovers: previousRows.map((cover) => ({
        id: cover.id,
        selectedVisualFamily: cover.composition_family === 'living-system' ? 'Living Tapestry' : 'Living Still',
        visualWorld: cover.physical_world,
        dominantScientificRelationship: cover.central_tension,
        silhouettePlan: cover.hero_description,
      })),
    }, apiKey, fetch, process.env.BRIEF_AI_MODEL)
    const editorialDistinctivenessReview = reviewEditorialDistinctiveness({ phase: '4B', direction: result.direction })
    print({
      draftId,
      conceptId,
      phase: '4B',
      persisted: false,
      imageProviderInvoked: false,
      previousCoverCount: previousRows.length,
      coverStory,
      selectedConcept,
      editorialDistinctivenessReview,
      acceptedForPhase4C: editorialDistinctivenessReview.passed,
      ...result,
    })
    return
  }

  if (command === 'compile-cover-prompt') {
    const draftId = positional(0, 'draft id')
    const conceptId = option('concept') ?? option('candidate', true)
    const directionFile = option('direction-file', true)
    const phase4bResult = JSON.parse(await readFile(directionFile, 'utf8'))
    if (phase4bResult.conceptId && phase4bResult.conceptId !== conceptId) {
      throw new Error(`Phase 4B direction does not belong to ${conceptId}`)
    }
    const coverStory = phase4bResult.coverStory
    const selectedConcept = phase4bResult.selectedConcept
    const visualDirection = phase4bResult.direction
    if (!coverStory || !selectedConcept || !visualDirection) {
      throw new Error('Direction file must contain coverStory, selectedConcept, and direction from Phase 4B')
    }
    const conceptEditorialReview = assertEditorialDistinctiveness({ phase: '4A', concept: selectedConcept })
    const editorialDistinctivenessReview = assertEditorialDistinctiveness({ phase: '4B', direction: visualDirection })
    const draft = await checked(supabase.from('editorial_drafts')
      .select('id,status,editorial_thesis,theme_confidence')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    const [artBibleContent, foundingCoverDnaContent] = await Promise.all([
      readFile('.claude/VITALSPAN_ART_BIBLE.md', 'utf8'),
      readFile('.claude/FOUNDING_COVER_DNA.md', 'utf8'),
    ])
    const result = compileGptImage2CoverPrompt({
      coverStory,
      selectedConcept,
      visualDirection,
      artBible: {
        version: documentVersion(artBibleContent, 'current'),
        content: artBibleContent,
      },
      foundingCoverDna: {
        version: documentVersion(foundingCoverDnaContent, 'current'),
        content: foundingCoverDnaContent,
      },
    })
    print({
      draftId,
      conceptId,
      phase: '4C',
      persisted: false,
      providerInvoked: false,
      coverStory,
      selectedConcept,
      visualDirectionSummary: {
        selectedVisualFamily: visualDirection.selectedVisualFamily,
        visualWorld: visualDirection.visualWorld,
        dominantScientificRelationship: visualDirection.dominantScientificRelationship,
        silhouettePlan: visualDirection.silhouettePlan,
      },
      conceptEditorialReview,
      editorialDistinctivenessReview,
      exactFinalPrompt: result.compiled.finalPrompt,
      exactExclusions: result.compiled.exclusionPrompt,
      parameters: result.compiled.providerParameters,
      promptWordCount: result.compiled.promptWordCount,
      promptVersion: result.compiled.promptVersion,
      validation: result.validation,
    })
    return
  }

  if (command === 'create-cover-direction' || command === 'create-cover-concept') {
    throw new Error('Legacy issue-thesis cover persistence is disabled; use the story-first Phase 4A–4C commands')
  }

  if (command === 'generate-cover') {
    print(await invokeCoverPipeline(url, positional(0, 'draft id')))
    return
  }

  if (command === 'inspect-cover') {
    const draftId = positional(0, 'draft id')
    const generations = await checked(supabase.from('editorial_cover_generations')
      .select('id,draft_id,version,status,issue_number_snapshot,issue_title_snapshot,theme_confidence,theme_type,composition_family,hero_object,supporting_forms,controlled_impossibility,unresolved_state,palette,crop_plan,provider_id,provider_model,render_size,render_quality,output_mime_type,output_bytes,output_width,output_height,generation_duration_ms,estimated_cost_usd,storage_bucket,storage_path,asset_sha256,prompt_sha256,provider_request_id,created_at,generation_started_at,generation_completed_at,approved_by,approved_at,rejected_by,rejected_at,rejection_reason,failed_at,failure_code,failure_message')
      .eq('draft_id', draftId).order('version', { ascending: false }))
    const newest = generations[0]
    let signedReviewUrl = null
    if (newest?.storage_bucket === 'brief-covers' && newest.storage_path) {
      const { data, error } = await supabase.storage.from('brief-covers').createSignedUrl(newest.storage_path, 300)
      if (error) throw new Error(error.message)
      signedReviewUrl = data?.signedUrl ?? null
    }
    print({ generations, newestSignedReviewUrl: signedReviewUrl, signedUrlExpiresInSeconds: signedReviewUrl ? 300 : null })
    return
  }

  if (command === 'approve-cover') {
    print(await checked(supabase.rpc('approve_cover', { p_draft_id: positional(0, 'draft id') })))
    return
  }

  if (command === 'reject-cover') {
    print(await checked(supabase.rpc('reject_cover', {
      p_draft_id: positional(0, 'draft id'),
      p_reason: option('reason', true),
    })))
    return
  }

  if (command === 'regenerate-cover') {
    const draftId = positional(0, 'draft id')
    await checked(supabase.rpc('regenerate_cover', { p_draft_id: draftId }))
    print(await invokeCoverPipeline(url, draftId))
    return
  }

  if (command === 'candidates') {
    const status = option('status')
    let query = supabase.from('article_candidates')
      .select('id,pmid,doi,title,journal,publication_date,study_type,sample_size,topics,biomarker_tags,evidence_score,relevance_score,novelty_score,safety_flags,editorial_headline,ai_summary,ai_takeaway,limitations,evidence_label,status,source_url')
      .order('evidence_score', { ascending: false }).limit(100)
    if (status) query = query.eq('status', status)
    print(await checked(query))
    return
  }

  if (command === 'drafts') {
    const status = option('status')
    let query = supabase.from('editorial_drafts').select('*').order('created_at', { ascending: false }).limit(50)
    if (status) query = query.eq('status', status)
    print(await checked(query))
    return
  }

  if (command === 'jobs') {
    print(await checked(supabase.from('publication_jobs').select('*').order('started_at', { ascending: false }).limit(50)))
    return
  }

  if (command === 'show') {
    const draftId = positional(0, 'draft id')
    const draft = await checked(supabase.from('editorial_drafts').select('*').eq('id', draftId).single())
    const candidates = await checked(supabase.from('article_candidates')
      .select('id,pmid,doi,title,abstract,journal,publication_date,study_type,sample_size,topics,biomarker_tags,evidence_score,relevance_score,novelty_score,safety_flags,editorial_headline,ai_summary,ai_takeaway,limitations,evidence_label,status,source_url')
      .in('id', draft.candidate_ids))
    const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]))
    print({ ...draft, candidates: draft.candidate_ids.map((id) => byId.get(id)) })
    return
  }

  if (command === 'review-candidate') {
    const candidateId = positional(0, 'candidate id')
    print(await checked(supabase.rpc('review_article_candidate', {
      p_candidate_id: candidateId,
      p_status: option('status', true),
    })))
    return
  }

  if (command === 'edit-candidate') {
    const candidateId = positional(0, 'candidate id')
    print(await checked(supabase.rpc('update_article_candidate_editorial', {
      p_candidate_id: candidateId,
      p_headline: option('headline', true),
      p_summary: option('summary', true),
      p_takeaway: option('takeaway', true),
      p_limitations: option('limitations') ?? '',
      p_evidence_label: option('evidence') ?? '',
    })))
    return
  }

  if (command === 'edit-draft') {
    const draftId = positional(0, 'draft id')
    print(await checked(supabase.rpc('update_editorial_draft', {
      p_draft_id: draftId,
      p_cover_candidate_id: option('cover', true),
      p_candidate_ids: option('order', true).split(',').map((value) => value.trim()),
      p_title: option('title', true),
      p_pharmacist_note: option('note') ?? '',
    })))
    return
  }

  if (command === 'backfill-issue-one-intelligence') {
    print(await checked(supabase.rpc('backfill_issue_one_editorial_intelligence', {
      p_draft_id: positional(0, 'draft id'),
    })))
    return
  }

  if (command === 'review-draft') {
    const draftId = positional(0, 'draft id')
    print(await checked(supabase.rpc('review_editorial_draft', {
      p_draft_id: draftId,
      p_status: option('status', true),
    })))
    return
  }

  if (command === 'publish') {
    const draftId = positional(0, 'draft id')
    if (option('confirm') !== 'publish') throw new Error('Publication requires --confirm publish')
    const issueNumber = await checked(supabase.rpc('publish_editorial_draft', { p_draft_id: draftId }))
    print({ published: true, issueNumber })
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

main().catch((error) => {
  process.stderr.write(`brief-admin: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})

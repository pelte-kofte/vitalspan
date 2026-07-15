#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import {
  ART_BIBLE_SHA256,
  COVER_PROMPT_VERSION,
  PERMANENT_EXCLUSION_BLOCK,
  PERMANENT_STYLE_BLOCK,
  auditCoverConcept,
  buildLegacyCoverDirection,
} from '../supabase/functions/_shared/briefCover.ts'
import {
  DEFAULT_COVER_CONCEPT_BOUNDARIES,
  generateAnthropicCoverMetaphorCandidates,
} from '../supabase/functions/_shared/briefCoverConcept.ts'
import {
  generateAnthropicVisualDirection,
  selectCandidateFromPhase4AResult,
} from '../supabase/functions/_shared/briefCoverDirection.ts'

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
  npm run brief:admin -- generate-cover-direction <draft-id> --candidate <candidateId> [--candidate-file <phase4a-result.json>]
  npm run brief:admin -- create-cover-direction <draft-id> --fixture fixtures/brief/issue-1-draft.json
  npm run brief:admin -- create-cover-concept <draft-id> --fixture fixtures/brief/issue-1-draft.json  legacy alias
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
      .select('id,status,editorial_thesis,theme_confidence,theme_type,theme_evidence')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    if (!draft.editorial_thesis || !draft.theme_confidence || !draft.theme_type) {
      throw new Error('Draft must contain approved editorial intelligence')
    }
    const evidence = Array.isArray(draft.theme_evidence)
      ? draft.theme_evidence.map((item) => ({ sourcePhrase: item?.sourcePhrase })).filter((item) => item.sourcePhrase)
      : []
    const candidates = await generateAnthropicCoverMetaphorCandidates({
      editorialThesis: draft.editorial_thesis,
      themeConfidence: draft.theme_confidence,
      themeType: draft.theme_type,
      evidence,
      claimsNotImply: [...DEFAULT_COVER_CONCEPT_BOUNDARIES],
    }, apiKey, fetch, process.env.BRIEF_AI_MODEL)
    print({
      draftId,
      phase: '4A',
      persisted: false,
      downstreamInvoked: false,
      candidates: candidates.map((candidate, index) => ({
        candidateId: `candidate-${index + 1}`,
        candidate,
      })),
    })
    return
  }

  if (command === 'generate-cover-direction') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for visual direction generation')
    const draftId = positional(0, 'draft id')
    const candidateId = option('candidate', true)
    const candidateFile = option('candidate-file')
    const candidateJson = option('candidate-json')
    const phase4aResult = await readPhase4aResult(candidateFile, candidateJson)
    const selectedCandidate = selectCandidateFromPhase4AResult(candidateId, phase4aResult)
    const draft = await checked(supabase.from('editorial_drafts')
      .select('id,status,editorial_thesis,theme_confidence')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    if (!draft.editorial_thesis || !draft.theme_confidence) {
      throw new Error('Draft must contain approved editorial intelligence')
    }
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
      editorialThesis: draft.editorial_thesis,
      themeConfidence: draft.theme_confidence,
      selectedCandidate,
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
        visualMode: cover.composition_family === 'living-system' ? 'Living Tapestry' : 'Living Still',
        visualWorld: cover.physical_world,
        dominantRelationship: cover.central_tension,
        silhouettePlan: cover.hero_description,
      })),
    }, apiKey, fetch, process.env.BRIEF_AI_MODEL)
    print({
      draftId,
      candidateId,
      phase: '4B',
      persisted: false,
      imageProviderInvoked: false,
      previousCoverCount: previousRows.length,
      ...result,
    })
    return
  }

  if (command === 'create-cover-direction' || command === 'create-cover-concept') {
    if (command === 'create-cover-concept') {
      process.stderr.write('create-cover-concept is a compatibility alias; use create-cover-direction after Phase 4A selection\n')
    }
    const draftId = positional(0, 'draft id')
    const fixturePath = option('fixture', true)
    const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
    // Phase 4A concept generation happens before this legacy visual-direction
    // compatibility boundary. The persisted/rendered contract remains unchanged.
    const concept = buildLegacyCoverDirection(fixture)
    const audit = auditCoverConcept(concept)
    if (!audit.passed) throw new Error(`Cover concept audit failed: ${audit.failures.join(', ')}`)
    const draft = await checked(supabase.from('editorial_drafts')
      .select('id,status,candidate_ids')
      .eq('id', draftId).single())
    if (draft.status !== 'ready_for_review') throw new Error('Draft must be ready_for_review')
    const candidates = await checked(supabase.from('article_candidates')
      .select('id,pmid').in('id', draft.candidate_ids))
    const candidateByPmid = new Map(candidates.map((candidate) => [candidate.pmid, candidate.id]))
    const supportingSources = concept.supportingSources.map((source, index) => {
      const candidateId = candidateByPmid.get(source.pmid)
      if (!candidateId) throw new Error(`Fixture PMID ${source.pmid} is not selected in this draft`)
      return { ...source, candidateId, ordinal: index + 1 }
    })
    print(await checked(supabase.rpc('create_cover_concept', {
      p_draft_id: draftId,
      p_concept: {
        artBibleVersion: concept.artBible.version,
        artBibleSha256: ART_BIBLE_SHA256,
        promptVersion: COVER_PROMPT_VERSION,
        permanentStyleBlock: PERMANENT_STYLE_BLOCK,
        permanentExclusionBlock: PERMANENT_EXCLUSION_BLOCK,
        editorialThesis: concept.editorialThesis,
        themeConfidence: concept.themeConfidence,
        themeType: concept.themeType,
        centralTension: concept.centralTension,
        coverPaperRole: concept.coverPaperRole,
        compositionFamily: concept.compositionFamily,
        physicalWorld: concept.physicalWorld,
        heroObject: concept.heroObject,
        supportingForms: concept.supportingForms,
        dominantObjects: concept.dominantObjects,
        heroDescription: concept.heroDescription,
        controlledImpossibility: concept.controlledImpossibility,
        unresolvedState: concept.unresolvedState,
        supportedInterpretation: concept.supportedInterpretation,
        principalUncertainty: concept.principalUncertainty,
        claimsNotImply: concept.claimsNotImply,
        palette: concept.palette,
        cropPlan: concept.cropPlan,
        supportingSources,
      },
    })))
    return
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

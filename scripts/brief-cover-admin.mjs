#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { PROVIDER_CATALOG, buildProviderRequestPlan, estimateWeeklyCost } from '../supabase/functions/_shared/briefCover.ts'
import { DEFAULT_COVER_CONCEPT_BOUNDARIES, selectCoverMetaphorCandidates } from '../supabase/functions/_shared/briefCoverConcept.ts'
import { validateVisualDirection } from '../supabase/functions/_shared/briefCoverDirection.ts'
import {
  assertEditorialDistinctiveness,
  reviewEditorialDistinctiveness,
} from '../supabase/functions/_shared/briefCoverEditorialDistinctiveness.ts'
import { compileGptImage2CoverPrompt } from '../supabase/functions/_shared/briefCoverPromptCompiler.ts'

const DEFAULT_FIXTURE = 'fixtures/brief/issue-1-draft.json'
const DEFAULT_PREVIEW = 'fixtures/brief/issue-1-cover-preview.json'
const args = process.argv.slice(2)
const command = args.shift() ?? 'help'

function option(name) {
  const index = args.indexOf(`--${name}`)
  if (index < 0) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}`)
  return value
}

function print(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`) }
function documentVersion(content, fallback) { return content.match(/^Version:\s*([^\n]+)$/mi)?.[1]?.trim() ?? fallback }

function usage() {
  process.stdout.write(`The Vitalspan story-first cover preview CLI (local/read-only)

Commands:
  npm run brief:cover -- preview [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]
  npm run brief:cover -- concepts [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]
  npm run brief:cover -- direction [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]
  npm run brief:cover -- prompt [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]
  npm run brief:cover -- render-review [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]
  npm run brief:cover -- providers
  npm run brief:cover -- plan --provider openai|google|stability [--fixture ${DEFAULT_FIXTURE}] [--preview ${DEFAULT_PREVIEW}]

This CLI reads local fixtures only. It has no Supabase client and no image-generation,
publication, deployment, approval, rejection, or migration command.\n`)
}

async function loadPreview() {
  const fixturePath = option('fixture') ?? DEFAULT_FIXTURE
  const previewPath = option('preview') ?? DEFAULT_PREVIEW
  const [fixture, rawPreview, artBibleContent, foundingCoverDnaContent] = await Promise.all([
    readFile(fixturePath, 'utf8').then(JSON.parse),
    readFile(previewPath, 'utf8').then(JSON.parse),
    readFile('.claude/VITALSPAN_ART_BIBLE.md', 'utf8'),
    readFile('.claude/FOUNDING_COVER_DNA.md', 'utf8'),
  ])
  if (fixture.productionSupabaseCalled !== false) throw new Error('Local fixture must explicitly disable production Supabase')
  if (!Array.isArray(fixture.sources) || fixture.sources.length !== 5) throw new Error('Issue preview requires exactly five selected articles')
  const input = {
    articles: fixture.sources.map((source) => ({
      candidateId: source.candidateId,
      title: source.title,
      journal: source.journal,
      publicationDate: source.publicationDate,
      sourcePhrase: source.sourcePhrase,
    })),
    deterministicCoverArticleId: fixture.sources[0].candidateId,
    claimsNotImply: [...DEFAULT_COVER_CONCEPT_BOUNDARIES],
  }
  const selection = selectCoverMetaphorCandidates(input, {
    coverStory: rawPreview.coverStory,
    concepts: rawPreview.concepts,
  })
  const governance = {
    artBible: { version: documentVersion(artBibleContent, 'current'), content: artBibleContent },
    foundingCoverDna: { version: documentVersion(foundingCoverDnaContent, 'current'), content: foundingCoverDnaContent },
  }
  const directionResult = validateVisualDirection({
    coverStory: selection.coverStory,
    selectedConcept: selection.selectedConcept,
    ...governance,
    previousCovers: [],
  }, rawPreview.direction)
  if (!directionResult.validation.passed) {
    throw new Error(`Preview direction failed validation: ${directionResult.validation.errors.join(', ')}`)
  }
  const editorialDistinctivenessReview = reviewEditorialDistinctiveness({
    phase: '4B',
    direction: directionResult.direction,
  })
  const promptResult = editorialDistinctivenessReview.passed
    ? compileGptImage2CoverPrompt({
      coverStory: selection.coverStory,
      selectedConcept: selection.selectedConcept,
      visualDirection: directionResult.direction,
      ...governance,
    })
    : null
  const finalRenderEditorialReview = reviewEditorialDistinctiveness({
    phase: '4D',
    concept: selection.selectedConcept,
    direction: directionResult.direction,
    compiledPrompt: promptResult?.compiled.finalPrompt ?? '',
  })
  return {
    fixturePath,
    previewPath,
    fixture,
    selection,
    directionResult,
    editorialDistinctivenessReview,
    finalRenderEditorialReview,
    promptResult,
  }
}

async function main() {
  if (command === 'help' || command === '--help') return usage()
  if (command === 'providers') {
    return print({
      localOnly: true,
      providerInvoked: false,
      imageGenerated: false,
      providers: Object.values(PROVIDER_CATALOG).map((provider) => ({
        ...provider,
        estimatedWeeklyUsdForThreeConceptsAndOneFinal: estimateWeeklyCost(provider.id),
      })),
    })
  }
  if (['generate', 'publish', 'deploy', 'migrate', 'approve', 'reject'].includes(command)) {
    throw new Error(`${command} is intentionally unavailable in the local preview CLI`)
  }

  const loaded = await loadPreview()
  const {
    fixture,
    selection,
    directionResult,
    editorialDistinctivenessReview,
    finalRenderEditorialReview,
    promptResult,
  } = loaded
  if (command === 'concepts' || command === 'concept') {
    return print({
      localOnly: true,
      productionSupabaseCalled: false,
      providerInvoked: false,
      imageGenerated: false,
      coverStory: selection.coverStory,
      concepts: selection.concepts,
      strongestTwo: selection.strongestTwo,
      selectedConcept: selection.selectedConcept,
    })
  }
  if (command === 'direction') return print({
    direction: directionResult.direction,
    validation: directionResult.validation,
    editorialDistinctivenessReview,
    acceptedForPhase4C: editorialDistinctivenessReview.passed,
  })
  if (command === 'prompt') {
    assertEditorialDistinctiveness({ phase: '4B', direction: directionResult.direction })
    return print({
      editorialDistinctivenessReview,
      exactCompiledPrompt: promptResult.compiled.finalPrompt,
      wordCount: promptResult.compiled.promptWordCount,
      validation: promptResult.validation,
    })
  }
  if (command === 'render-review') return print({
    localOnly: true,
    productionSupabaseCalled: false,
    providerInvoked: false,
    imageGenerated: false,
    finalRenderEditorialReview,
  })
  if (command === 'preview') {
    const selectedArticle = fixture.sources.find((article) => article.candidateId === selection.coverStory.coverStoryCandidateId)
    return print({
      localOnly: true,
      productionSupabaseCalled: false,
      providerInvoked: false,
      imageGenerated: false,
      issueNumber: fixture.issueNumber,
      issueTitle: fixture.issueTitle,
      allFiveArticles: fixture.sources.map(({ candidateId, pmid, title, journal, publicationDate, sourcePhrase }) => ({
        candidateId, pmid, title, journal, publicationDate, sourcePhrase,
      })),
      selectedCoverStory: selectedArticle,
      whyItWon: selection.coverStory.coverStoryReason,
      centralFinding: selection.coverStory.centralFinding,
      editorialQuestion: selection.coverStory.editorialQuestion,
      principalUncertainty: selection.coverStory.principalUncertainty,
      visualStorySentence: selection.coverStory.visualStorySentence,
      concepts: selection.concepts,
      strongestTwoConcepts: selection.strongestTwo,
      selectedConcept: selection.selectedConcept,
      selectedVisualFamily: directionResult.direction.selectedVisualFamily,
      familyJustification: directionResult.direction.familyJustification,
      fullVisualDirection: directionResult.direction,
      editorialDistinctivenessReview,
      finalRenderEditorialReview,
      phase4cBlocked: !editorialDistinctivenessReview.passed,
      phase4dBlocked: !finalRenderEditorialReview.passed,
      exactCompiledPrompt: promptResult?.compiled.finalPrompt ?? null,
      promptWordCount: promptResult?.compiled.promptWordCount ?? null,
    })
  }
  if (command === 'plan') {
    assertEditorialDistinctiveness({
      phase: '4D',
      concept: selection.selectedConcept,
      direction: directionResult.direction,
      compiledPrompt: promptResult?.compiled.finalPrompt ?? '',
    })
    const provider = option('provider')
    if (!provider || !(provider in PROVIDER_CATALOG)) throw new Error('--provider must be openai, google, or stability')
    return print(buildProviderRequestPlan(provider, promptResult.compiled.finalPrompt))
  }
  throw new Error(`Unknown command: ${command}`)
}

main().catch((error) => {
  process.stderr.write(`brief-cover: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})

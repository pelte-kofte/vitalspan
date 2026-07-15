#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import {
  PROVIDER_CATALOG,
  auditCoverConcept,
  buildLegacyCoverDirection,
  buildProductionCoverPreview,
  buildProviderRequestPlan,
  estimateWeeklyCost,
} from '../supabase/functions/_shared/briefCover.ts'

const DEFAULT_FIXTURE = 'fixtures/brief/issue-1-draft.json'
const args = process.argv.slice(2)
const command = args.shift() ?? 'help'

function option(name) {
  const index = args.indexOf(`--${name}`)
  if (index < 0) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}`)
  return value
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function usage() {
  process.stdout.write(`The Vitalspan Brief cover direction preview CLI (local/read-only)

Commands:
  npm run brief:cover -- preview [--fixture ${DEFAULT_FIXTURE}]
  npm run brief:cover -- direction [--fixture ${DEFAULT_FIXTURE}]
  npm run brief:cover -- concept [--fixture ${DEFAULT_FIXTURE}]  legacy alias
  npm run brief:cover -- providers
  npm run brief:cover -- plan --provider openai|google|stability [--fixture ${DEFAULT_FIXTURE}]

This Phase 3C preview CLI runs under Node's permission model with filesystem read-only
access. It has no Supabase client, provider execution function, or
generate/publish/deploy command.\n`)
}

async function loadConcept() {
  const path = option('fixture') ?? DEFAULT_FIXTURE
  const raw = JSON.parse(await readFile(path, 'utf8'))
  const concept = buildLegacyCoverDirection(raw)
  const audit = auditCoverConcept(concept)
  if (!audit.passed) throw new Error(`Concept audit failed: ${audit.failures.join(', ')}`)
  return { path, concept, audit }
}

async function main() {
  if (command === 'help' || command === '--help') {
    usage()
  } else if (command === 'providers') {
    print({
      localOnly: true,
      providerInvoked: false,
      imageGenerated: false,
      providers: Object.values(PROVIDER_CATALOG).map((provider) => ({
        ...provider,
        estimatedWeeklyUsdForThreeConceptsAndOneFinal: estimateWeeklyCost(provider.id),
      })),
    })
  } else if (command === 'direction' || command === 'concept') {
    const { concept, audit } = await loadConcept()
    print({ concept, audit })
  } else if (command === 'preview') {
    const { path, concept } = await loadConcept()
    print({ fixture: path, ...buildProductionCoverPreview(concept) })
  } else if (command === 'plan') {
    const provider = option('provider')
    if (!provider || !(provider in PROVIDER_CATALOG)) {
      throw new Error('--provider must be openai, google, or stability')
    }
    const { concept } = await loadConcept()
    print(buildProviderRequestPlan(provider, concept.prompt))
  } else if (['generate', 'publish', 'deploy'].includes(command)) {
    throw new Error(`${command} is intentionally unavailable in the local preview CLI`)
  } else {
    throw new Error(`Unknown command: ${command}`)
  }
}

main().catch((error) => {
  process.stderr.write(`brief-cover: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})

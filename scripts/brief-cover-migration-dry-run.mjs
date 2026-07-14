#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const migrationRelative = 'supabase/migrations/20260715000000_brief_cover_pipeline.sql'
const baselineRelative = 'supabase/migrations/20260714000000_brief_editorial_pipeline.sql'
const migration = await readFile(path.join(root, migrationRelative), 'utf8')
const baseline = await readFile(path.join(root, baselineRelative), 'utf8')

function balancedParentheses(sql) {
  let depth = 0
  let quote = null
  let lineComment = false
  let blockComment = false
  for (let i = 0; i < sql.length; i += 1) {
    const current = sql[i]
    const next = sql[i + 1]
    if (lineComment) {
      if (current === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (current === '*' && next === '/') {
        blockComment = false
        i += 1
      }
      continue
    }
    if (!quote && current === '-' && next === '-') {
      lineComment = true
      i += 1
      continue
    }
    if (!quote && current === '/' && next === '*') {
      blockComment = true
      i += 1
      continue
    }
    if (current === "'" && quote !== 'dollar') {
      if (quote === 'single' && next === "'") {
        i += 1
      } else {
        quote = quote === 'single' ? null : 'single'
      }
      continue
    }
    if (!quote && current === '$' && next === '$') {
      quote = 'dollar'
      i += 1
      continue
    }
    if (quote === 'dollar' && current === '$' && next === '$') {
      quote = null
      i += 1
      continue
    }
    if (quote) continue
    if (current === '(') depth += 1
    if (current === ')') depth -= 1
    if (depth < 0) return false
  }
  return depth === 0 && quote === null && !blockComment
}

const checks = {
  productionMigrationPath: migrationRelative.split('/').length === 3,
  wrappedInTransaction: /^\s*--[\s\S]*?\bBEGIN;/.test(migration) && /COMMIT;\s*$/.test(migration),
  sqlStructureBalanced: balancedParentheses(migration),
  baselineDefinesDrafts: /CREATE TABLE IF NOT EXISTS public\.editorial_drafts/.test(baseline),
  baselineDefinesCandidates: /CREATE TABLE IF NOT EXISTS public\.article_candidates/.test(baseline),
  baselineDefinesAdminGate: /CREATE OR REPLACE FUNCTION public\.is_brief_admin/.test(baseline),
  baselineDefinesUpdatedAtTriggerFunction: /CREATE OR REPLACE FUNCTION public\.set_brief_updated_at/.test(baseline),
  generationTablePresent: /CREATE TABLE public\.editorial_cover_generations/.test(migration),
  normalizedSourceEvidencePresent: /CREATE TABLE public\.editorial_cover_generation_sources/.test(migration),
  rlsEnabledOnBothTables: (migration.match(/ENABLE ROW LEVEL SECURITY/g) ?? []).length === 2,
  adminReadGateOnBothTables: (migration.match(/public\.is_brief_admin\(\)/g) ?? []).length >= 6,
  noDirectClientWriteGrant: !/GRANT\s+(?:INSERT|UPDATE|DELETE|ALL)[\s\S]*?TO\s+(?:anon|authenticated)/i.test(migration),
  noAnonCoverPolicy: !/CREATE POLICY[\s\S]*?ON public\.editorial_cover[\s\S]*?TO\s+anon/i.test(migration),
  protectedRpcsRevokePublic: (migration.match(/REVOKE ALL ON FUNCTION public\.(?:create|regenerate|approve|reject|begin|complete|fail)_cover/g) ?? []).length === 7,
  serviceOnlyGenerationRpcs: (migration.match(/GRANT EXECUTE ON FUNCTION public\.(?:begin|complete|fail)_cover_generation[\s\S]*?TO service_role;/g) ?? []).length === 3,
  noCredentialColumns: !/^\s+(?:access_token|refresh_token|api_key|password|provider_response)\b/im.test(migration),
  noBinaryImageColumn: !/^\s+(?:image|image_data|image_bytes|base64)\s+(?:bytea|text)\b/im.test(migration),
  renderRequiresProvenance: /CONSTRAINT editorial_cover_generation_asset_consistent/.test(migration),
  confidenceConstrainsComposition: /CONSTRAINT editorial_cover_generation_confidence_composition/.test(migration),
  privateBucket: /VALUES \('brief-covers', 'brief-covers', false/.test(migration),
  publicationRequiresApprovedCover: /an explicitly approved cover is required/.test(migration),
  legacyIssuesRemainNullable: /ADD COLUMN IF NOT EXISTS cover_generation_id uuid/.test(migration),
  approvedGenerationImmutable: /approved cover generations are immutable/.test(migration),
  storagePathsRejectTraversalAndUrls: (migration.match(/!~ '\(\^\/\|\\\\\.\\\\\.\|:\/\/\)'/g) ?? []).length >= 2,
}

const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
const result = {
  mode: 'production-migration-static-preflight',
  migration: migrationRelative,
  productionSupabaseCalled: false,
  linkedProjectInspected: false,
  databaseEngineExecuted: false,
  databaseEngineReason: 'This script is a static preflight. The required linked Supabase CLI dry run is executed separately with --dry-run and never applies changes.',
  checks,
  passed: failures.length === 0,
  failures,
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
if (failures.length > 0) process.exitCode = 1

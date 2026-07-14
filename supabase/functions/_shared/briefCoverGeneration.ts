import {
  ART_BIBLE,
  ART_BIBLE_SHA256,
  COVER_PROMPT_VERSION,
  COVER_STORAGE_BUCKET,
  OPENAI_COVER_CONFIG,
  PERMANENT_EXCLUSION_BLOCK,
  PERMANENT_STYLE_BLOCK,
  auditCoverConcept,
  buildCoverPrompt,
  coverStoragePath,
  type CoverConcept,
  type CoverPalette,
  type CoverCompositionFamily,
  type ThemeConfidence,
} from "./briefCover.ts";
import {
  CoverProviderError,
  generateOpenAICover,
  sha256Hex,
  type GeneratedCoverAsset,
} from "./briefCoverProvider.ts";

export interface ClaimedCoverGeneration {
  id: string;
  draft_id: string;
  version: number;
  issue_number_snapshot: number;
  issue_title_snapshot: string;
  editorial_thesis: string;
  theme_confidence: ThemeConfidence;
  theme_type: string;
  central_tension: string;
  cover_paper_role: string;
  composition_family: CoverCompositionFamily;
  physical_world: string;
  hero_object: string;
  supporting_forms: string[];
  dominant_objects: string[];
  hero_description: string;
  controlled_impossibility: string;
  unresolved_state: string;
  supported_interpretation: string;
  principal_uncertainty: string;
  claims_not_imply: string[];
  palette: CoverPalette;
  crop_plan: CoverConcept["cropPlan"];
  permanent_style_block: string;
  permanent_exclusion_block: string;
  art_bible_version: string;
  art_bible_sha256: string;
  prompt_version: number;
}

export interface ClaimedCoverSource {
  candidate_id: string;
  pmid: string;
  source_phrase: string;
  ordinal: number;
}

export interface CoverCompletionMetadata {
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
  assetSha256: string;
  durationMs: number;
  providerRequestId: string | null;
  estimatedCostUsd: number;
  finalPrompt: string;
  promptSha256: string;
}

export interface CoverGenerationRepository {
  claim(draftId: string): Promise<{ generation: ClaimedCoverGeneration; sources: ClaimedCoverSource[] }>;
  upload(bucket: string, path: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  complete(generationId: string, metadata: CoverCompletionMetadata): Promise<void>;
  fail(generationId: string, code: string, safeMessage: string): Promise<void>;
  remove?(bucket: string, path: string): Promise<void>;
}

export interface CoverGenerationDependencies {
  repository: CoverGenerationRepository;
  openAIApiKey: string;
  generate?: (prompt: string, apiKey: string) => Promise<GeneratedCoverAsset>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function conceptFromClaim(
  row: ClaimedCoverGeneration,
  sources: ClaimedCoverSource[],
): CoverConcept {
  if (row.permanent_style_block !== PERMANENT_STYLE_BLOCK
    || row.permanent_exclusion_block !== PERMANENT_EXCLUSION_BLOCK
    || row.art_bible_version !== ART_BIBLE.version
    || row.art_bible_sha256 !== ART_BIBLE_SHA256
    || row.prompt_version !== COVER_PROMPT_VERSION) {
    throw new Error("Cover concept does not match the canonical Art Bible/prompt version");
  }
  const orderedSources = [...sources].sort((left, right) => left.ordinal - right.ordinal);
  const conceptWithoutPrompt: Omit<CoverConcept, "prompt" | "execution"> = {
    schemaVersion: 1,
    conceptId: row.id,
    sourceFixtureId: "production-draft",
    issueNumber: row.issue_number_snapshot,
    issueTitle: row.issue_title_snapshot,
    artBible: ART_BIBLE,
    editorialThesis: row.editorial_thesis,
    themeConfidence: row.theme_confidence,
    themeType: row.theme_type,
    supportingSources: orderedSources.map((source) => ({
      candidateId: source.candidate_id,
      pmid: source.pmid,
      sourcePhrase: source.source_phrase,
    })),
    centralTension: row.central_tension,
    coverPaperRole: row.cover_paper_role,
    compositionFamily: row.composition_family,
    physicalWorld: row.physical_world,
    heroObject: row.hero_object,
    supportingForms: [...row.supporting_forms],
    dominantObjects: [...row.dominant_objects],
    heroDescription: row.hero_description,
    controlledImpossibility: row.controlled_impossibility,
    unresolvedState: row.unresolved_state,
    supportedInterpretation: row.supported_interpretation,
    principalUncertainty: row.principal_uncertainty,
    claimsNotImply: [...row.claims_not_imply],
    palette: { ...row.palette },
    cropPlan: { ...row.crop_plan },
  };
  const concept: CoverConcept = {
    ...conceptWithoutPrompt,
    prompt: buildCoverPrompt(conceptWithoutPrompt),
    execution: {
      mode: "concept-only",
      imageGenerated: false,
      providerInvoked: false,
      productionSupabaseCalled: false,
    },
  };
  const audit = auditCoverConcept(concept);
  if (!audit.passed) throw new Error(`Cover concept audit failed: ${audit.failures.join(", ")}`);
  return concept;
}

function safeFailure(error: unknown): { code: string; message: string } {
  if (error instanceof CoverProviderError) return { code: error.code, message: error.message.slice(0, 500) };
  return { code: "generation_failed", message: "Cover generation failed safely" };
}

export async function executeCoverGeneration(
  draftId: string,
  dependencies: CoverGenerationDependencies,
): Promise<{ generationId: string; status: "ready_for_review"; storagePath: string }> {
  if (!UUID.test(draftId)) throw new Error("draftId must be a UUID");
  let generationId: string | null = null;
  let uploadedPath: string | null = null;
  try {
    const claimed = await dependencies.repository.claim(draftId);
    generationId = claimed.generation.id;
    const concept = conceptFromClaim(claimed.generation, claimed.sources);
    const prompt = concept.prompt;
    const promptSha256 = await sha256Hex(prompt);
    const generate = dependencies.generate ?? generateOpenAICover;
    const asset = await generate(prompt, dependencies.openAIApiKey);
    uploadedPath = coverStoragePath(draftId, generationId);
    await dependencies.repository.upload(
      COVER_STORAGE_BUCKET,
      uploadedPath,
      asset.bytes,
      asset.mimeType,
    );
    await dependencies.repository.complete(generationId, {
      storageBucket: COVER_STORAGE_BUCKET,
      storagePath: uploadedPath,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      byteSize: asset.byteSize,
      assetSha256: await sha256Hex(asset.bytes),
      durationMs: asset.durationMs,
      providerRequestId: asset.providerRequestId,
      estimatedCostUsd: asset.estimatedCostUsd,
      finalPrompt: prompt,
      promptSha256,
    });
    return { generationId, status: "ready_for_review", storagePath: uploadedPath };
  } catch (error) {
    if (generationId) {
      if (uploadedPath && dependencies.repository.remove) {
        try {
          await dependencies.repository.remove(COVER_STORAGE_BUCKET, uploadedPath);
        } catch {
          // The private deterministic path remains non-public if cleanup fails.
        }
      }
      const failure = safeFailure(error);
      try {
        await dependencies.repository.fail(generationId, failure.code, failure.message);
      } catch {
        // Preserve the original error; database monitoring must reconcile a stuck claim.
      }
    }
    throw error;
  }
}

export const COVER_GENERATION_PROVIDER = {
  provider: OPENAI_COVER_CONFIG.provider,
  model: OPENAI_COVER_CONFIG.model,
  size: OPENAI_COVER_CONFIG.size,
  quality: OPENAI_COVER_CONFIG.quality,
  outputFormat: OPENAI_COVER_CONFIG.outputFormat,
  imageCount: OPENAI_COVER_CONFIG.imageCount,
  estimatedCostUsd: OPENAI_COVER_CONFIG.estimatedCostUsd,
};

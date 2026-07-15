export type ThemeConfidence = "high" | "medium" | "low";
export type CoverCompositionFamily =
  | "singular-transformation"
  | "tension-still-life"
  | "living-system"
  | "threshold"
  | "constellation";
export type CoverImageProviderId = "openai" | "google" | "stability";

export interface IssueCoverSource {
  candidateId: string;
  pmid: string;
  title: string;
  journal: string;
  publicationDate: string;
  doi: string | null;
  sourcePhrase: string;
}

export interface CoverPalette {
  ground: string;
  structural: string;
  biological: string;
  accent: string | null;
  accentPercent: number;
}

export interface IssueCoverFixture {
  fixtureVersion: 1;
  fixtureId: string;
  source: "local-task-context";
  productionSupabaseCalled: false;
  issueNumber: number;
  issueTitle: string;
  editorialThesis: string;
  themeConfidence: ThemeConfidence;
  themeType: string;
  sources: IssueCoverSource[];
  direction: {
    centralTension: string;
    coverPaperRole: string;
    compositionFamily: CoverCompositionFamily;
    physicalWorld: string;
    heroObject: string;
    supportingForms: string[];
    dominantObjects: string[];
    heroDescription: string;
    controlledImpossibility: string;
    unresolvedState: string;
    supportedInterpretation: string;
    principalUncertainty: string;
    claimsNotImply: string[];
    palette: CoverPalette;
    cropPlan: {
      masterAspectRatio: "3:4";
      upperQuietPercent: 18;
      centralSafePercent: 70;
      lowerNonessentialPercent: number;
    };
  };
}

export interface CoverConcept {
  schemaVersion: 1;
  conceptId: string;
  sourceFixtureId: string;
  issueNumber: number;
  issueTitle: string;
  artBible: {
    path: ".claude/VITALSPAN_ART_BIBLE.md";
    version: "1.0";
    constitutionName: "The Living Still";
  };
  editorialThesis: string;
  themeConfidence: ThemeConfidence;
  themeType: string;
  supportingSources: Array<Pick<IssueCoverSource, "candidateId" | "pmid" | "sourcePhrase">>;
  centralTension: string;
  coverPaperRole: string;
  compositionFamily: CoverCompositionFamily;
  physicalWorld: string;
  heroObject: string;
  supportingForms: string[];
  dominantObjects: string[];
  heroDescription: string;
  controlledImpossibility: string;
  unresolvedState: string;
  supportedInterpretation: string;
  principalUncertainty: string;
  claimsNotImply: string[];
  palette: CoverPalette;
  cropPlan: IssueCoverFixture["direction"]["cropPlan"];
  prompt: string;
  execution: {
    mode: "concept-only";
    imageGenerated: false;
    providerInvoked: false;
    productionSupabaseCalled: false;
  };
}

export interface CoverConceptAudit {
  passed: boolean;
  checks: Record<string, boolean>;
  failures: string[];
}

export interface ProviderDescriptor {
  id: CoverImageProviderId;
  model: string;
  role: "primary" | "benchmark" | "fallback";
  requiredSecrets: string[];
  supportsNegativePrompt: boolean;
  supportsSeed: boolean;
  supportsEditing: boolean;
  supportsThreeByFour: boolean;
  estimatedUsd: { mediumConcept: number; highFinal: number };
  notes: string[];
}

export interface ProviderRequestPlan {
  provider: CoverImageProviderId;
  model: string;
  endpointTemplate: string;
  request: Record<string, unknown>;
  requiredSecrets: string[];
  postprocess?: {
    operation: "center-crop";
    targetAspectRatio: "3:4";
    constraint: "within-crop-safe-zone";
  };
  safety: {
    executionEnabled: false;
    networkAllowed: false;
    credentialsIncluded: false;
    imageGenerated: false;
  };
}

export const ART_BIBLE = {
  path: ".claude/VITALSPAN_ART_BIBLE.md" as const,
  version: "1.0" as const,
  constitutionName: "The Living Still" as const,
};

export const ART_BIBLE_SHA256 = "43e83d69e275c5a5227f19f7f5fb9fa519659bf4a4a2ad9f5abf1e53347499d0";
export const COVER_PROMPT_VERSION = 1;
export const COVER_STORAGE_BUCKET = "brief-covers";
export const OPENAI_COVER_CONFIG = {
  provider: "openai" as const,
  model: "gpt-image-2" as const,
  endpoint: "https://api.openai.com/v1/images/generations" as const,
  size: "1152x1536" as const,
  width: 1152,
  height: 1536,
  quality: "medium" as const,
  outputFormat: "png" as const,
  imageCount: 1 as const,
  requestTimeoutMs: 120_000,
  maxOutputBytes: 15 * 1024 * 1024,
  estimatedCostUsd: 0.05,
};

export const PERMANENT_STYLE_BLOCK = [
  "Create a quiet hand-painted editorial world on a warm cold-press paper ground.",
  "Use opaque gouache with restrained translucent glaze, dry-brush edges, visible paper tooth, and simplified naturalistic forms.",
  "Light the scene with cool morning light from the upper left at approximately 4300–4800K, with soft chromatic shadows.",
  "Keep the upper 18% quiet, all essential meaning inside the central 70%, and the lower 12–15% free of essential detail.",
  "The image must communicate one idea through metaphor rather than literal medical illustration.",
].join("\n");

export const PERMANENT_EXCLUSION_BLOCK = [
  "No typography, lettering, labels, captions, numbers, logos, signatures, or watermarks in the artwork.",
  "No photorealism, glossy 3D rendering, vector-flat graphics, stock wellness imagery, medical infographic language, anatomical cutaways, pills as hero objects, glowing organs, neon gradients, or decorative surrealism.",
  "No visual claim stronger than the evidence. Do not imply causation, certainty, a shared mechanism, clinical recommendation, or cross-population generalizability unless the supplied evidence explicitly supports it.",
  "Use no more than one controlled impossibility and no more than one accent color occupying 5–12% of the image.",
].join("\n");

const EXPECTED_COMPOSITION: Record<ThemeConfidence, CoverCompositionFamily[]> = {
  high: ["singular-transformation", "living-system"],
  medium: ["tension-still-life", "threshold"],
  low: ["constellation"],
};

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be empty`);
}

export function buildCoverPrompt(input: Omit<CoverConcept, "prompt" | "execution">): string {
  const sourcePhrases = input.supportingSources
    .map((source, index) => `${index + 1}. ${source.sourcePhrase}`)
    .join("\n");
  const claims = input.claimsNotImply.map((claim) => `- ${claim}`).join("\n");
  const objects = input.dominantObjects.join(", ");
  const lowConfidenceInstruction = input.themeConfidence === "low"
    ? "Keep the five forms visually separate: no roots, threads, pathways, bridges, network lines, or shared mechanism."
    : "Keep relationships legible without turning them into a diagram.";

  return `${PERMANENT_STYLE_BLOCK}

WEEKLY EDITORIAL DIRECTION
Editorial thesis: ${input.editorialThesis}
Evidence confidence: ${input.themeConfidence}
Theme type: ${input.themeType}
Central tension: ${input.centralTension}
Cover paper role: ${input.coverPaperRole}
Physical world: ${input.physicalWorld}
Composition family: ${input.compositionFamily}
Hero object: ${input.heroObject}
Supporting forms: ${input.supportingForms.join(", ")}
Dominant objects: ${objects}
Hero description: ${input.heroDescription}
Controlled impossibility: ${input.controlledImpossibility}
Unresolved state: ${input.unresolvedState}
Supported interpretation: ${input.supportedInterpretation}
Principal uncertainty: ${input.principalUncertainty}
Palette: ${input.palette.ground}, ${input.palette.structural}, ${input.palette.biological}${input.palette.accent ? `, accent ${input.palette.accent} at ${input.palette.accentPercent}%` : ""}.
${lowConfidenceInstruction}

SUPPORTING SOURCE PHRASES
${sourcePhrases}

THE IMAGE MUST NOT IMPLY
${claims}

${PERMANENT_EXCLUSION_BLOCK}`;
}

/**
 * Builds the legacy visual-direction contract consumed by the unchanged Phase
 * 3C renderer. Phase 4A concept generation lives in briefCoverConcept.ts and
 * must complete before any caller reaches this compatibility boundary.
 */
export function buildLegacyCoverDirection(fixture: IssueCoverFixture): CoverConcept {
  if (fixture.fixtureVersion !== 1) throw new Error("Unsupported Issue 1 fixture version");
  if (fixture.productionSupabaseCalled !== false) throw new Error("A local fixture must not call production Supabase");
  requireText(fixture.editorialThesis, "editorialThesis");
  requireText(fixture.direction.centralTension, "centralTension");
  if (fixture.sources.length !== 5) throw new Error("The Issue 1 concept requires exactly five supporting sources");
  if (!EXPECTED_COMPOSITION[fixture.themeConfidence].includes(fixture.direction.compositionFamily)) {
    throw new Error(`${fixture.themeConfidence} confidence is incompatible with ${fixture.direction.compositionFamily}`);
  }
  if (fixture.direction.dominantObjects.length !== 5) {
    throw new Error("The Issue 1 concept requires exactly five dominant objects");
  }
  if (fixture.direction.supportingForms.length !== 4
    || !fixture.direction.dominantObjects.includes(fixture.direction.heroObject)
    || fixture.direction.supportingForms.some((form) => !fixture.direction.dominantObjects.includes(form))) {
    throw new Error("The cover direction requires one hero object and four supporting forms drawn from the dominant objects");
  }
  if (fixture.direction.cropPlan.masterAspectRatio !== "3:4"
    || fixture.direction.cropPlan.upperQuietPercent !== 18
    || fixture.direction.cropPlan.centralSafePercent !== 70
    || fixture.direction.cropPlan.lowerNonessentialPercent < 12
    || fixture.direction.cropPlan.lowerNonessentialPercent > 15) {
    throw new Error("The crop plan must match the canonical Art Bible safe zones");
  }
  if (fixture.direction.palette.accent) {
    if (fixture.direction.palette.accentPercent < 5 || fixture.direction.palette.accentPercent > 12) {
      throw new Error("Accent use must remain within the Art Bible's 5–12% range");
    }
  } else if (fixture.direction.palette.accentPercent !== 0) {
    throw new Error("accentPercent must be zero when no accent is selected");
  }

  const withoutPrompt: Omit<CoverConcept, "prompt" | "execution"> = {
    schemaVersion: 1,
    conceptId: `${fixture.fixtureId}-cover-v1`,
    sourceFixtureId: fixture.fixtureId,
    issueNumber: fixture.issueNumber,
    issueTitle: fixture.issueTitle,
    artBible: ART_BIBLE,
    editorialThesis: fixture.editorialThesis,
    themeConfidence: fixture.themeConfidence,
    themeType: fixture.themeType,
    supportingSources: fixture.sources.map(({ candidateId, pmid, sourcePhrase }) => ({
      candidateId,
      pmid,
      sourcePhrase,
    })),
    centralTension: fixture.direction.centralTension,
    coverPaperRole: fixture.direction.coverPaperRole,
    compositionFamily: fixture.direction.compositionFamily,
    physicalWorld: fixture.direction.physicalWorld,
    heroObject: fixture.direction.heroObject,
    supportingForms: [...fixture.direction.supportingForms],
    dominantObjects: [...fixture.direction.dominantObjects],
    heroDescription: fixture.direction.heroDescription,
    controlledImpossibility: fixture.direction.controlledImpossibility,
    unresolvedState: fixture.direction.unresolvedState,
    supportedInterpretation: fixture.direction.supportedInterpretation,
    principalUncertainty: fixture.direction.principalUncertainty,
    claimsNotImply: [...fixture.direction.claimsNotImply],
    palette: { ...fixture.direction.palette },
    cropPlan: { ...fixture.direction.cropPlan },
  };

  return {
    ...withoutPrompt,
    prompt: buildCoverPrompt(withoutPrompt),
    execution: {
      mode: "concept-only",
      imageGenerated: false,
      providerInvoked: false,
      productionSupabaseCalled: false,
    },
  };
}

export function auditCoverConcept(concept: CoverConcept): CoverConceptAudit {
  const narrative = [concept.heroDescription, concept.controlledImpossibility, concept.physicalWorld].join(" ").toLowerCase();
  const forbiddenLowConfidenceConnectors = /\b(roots?|threads?|pathways?|bridges?|network(?:ed)?|shared mechanism|interconnected)\b/;
  const typography = /\b(typography|lettering|caption|label|logo|watermark|written words?|text on)\b/;
  const checks: Record<string, boolean> = {
    canonicalArtBible: concept.artBible.path === ART_BIBLE.path && concept.artBible.version === ART_BIBLE.version,
    confidenceMatchesComposition: EXPECTED_COMPOSITION[concept.themeConfidence].includes(concept.compositionFamily),
    fiveSources: concept.supportingSources.length === 5,
    fiveDominantObjects: concept.dominantObjects.length === 5,
    noLowConfidenceConnectors: concept.themeConfidence !== "low" || !forbiddenLowConfidenceConnectors.test(narrative),
    noArtworkTypography: !typography.test(narrative),
    accentWithinRange: concept.palette.accent
      ? concept.palette.accentPercent >= 5 && concept.palette.accentPercent <= 12
      : concept.palette.accentPercent === 0,
    uncertaintyPresent: concept.principalUncertainty.trim().length > 0,
    claimsBounded: concept.claimsNotImply.length >= 3,
    cropRulesPresent: concept.prompt.includes("upper 18%") && concept.prompt.includes("central 70%") && concept.prompt.includes("lower 12–15%"),
    exactThreeByFourMaster: concept.cropPlan.masterAspectRatio === "3:4",
    noExecution: !concept.execution.imageGenerated && !concept.execution.providerInvoked && !concept.execution.productionSupabaseCalled,
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  return { passed: failures.length === 0, checks, failures };
}

export const PROVIDER_CATALOG: Record<CoverImageProviderId, ProviderDescriptor> = {
  openai: {
    id: "openai",
    model: "gpt-image-2",
    role: "primary",
    requiredSecrets: ["OPENAI_API_KEY"],
    supportsNegativePrompt: false,
    supportsSeed: false,
    supportsEditing: true,
    supportsThreeByFour: true,
    estimatedUsd: { mediumConcept: 0.05, highFinal: 0.20 },
    notes: [
      "Best fit for nuanced instruction following and later reference-image iteration.",
      "Budget is conservative for a custom 1152x1536 portrait render.",
    ],
  },
  google: {
    id: "google",
    model: "gemini-3.1-flash-image",
    role: "benchmark",
    requiredSecrets: ["GEMINI_API_KEY"],
    supportsNegativePrompt: false,
    supportsSeed: false,
    supportsEditing: true,
    supportsThreeByFour: true,
    estimatedUsd: { mediumConcept: 0.067, highFinal: 0.101 },
    notes: [
      "Current Google all-around image benchmark with 1K/2K portrait output, editing, references, and SynthID.",
      "Search grounding is intentionally absent so external imagery cannot enter the editorial concept silently.",
    ],
  },
  stability: {
    id: "stability",
    model: "stable-image-ultra",
    role: "fallback",
    requiredSecrets: ["STABILITY_API_KEY"],
    supportsNegativePrompt: true,
    supportsSeed: true,
    supportsEditing: true,
    supportsThreeByFour: false,
    estimatedUsd: { mediumConcept: 0.08, highFinal: 0.08 },
    notes: [
      "Useful when deterministic seed and explicit negative-prompt controls matter.",
      "Ultra has no native 3:4 ratio; request 4:5 and center-crop within the Art Bible crop-safe zone.",
    ],
  },
};

export function buildProviderRequestPlan(
  provider: CoverImageProviderId,
  prompt: string,
  quality: "medium" | "high" = "medium",
): ProviderRequestPlan {
  requireText(prompt, "prompt");
  const descriptor = PROVIDER_CATALOG[provider];
  let endpointTemplate: string;
  let request: Record<string, unknown>;
  let postprocess: ProviderRequestPlan["postprocess"] = undefined;

  if (provider === "openai") {
    endpointTemplate = "https://api.openai.com/v1/images/generations";
    request = {
      model: descriptor.model,
      prompt,
      size: "1152x1536",
      quality,
      output_format: "png",
      n: 1,
    };
  } else if (provider === "google") {
    endpointTemplate = "https://generativelanguage.googleapis.com/v1beta/interactions";
    request = {
      model: descriptor.model,
      input: prompt,
      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: "3:4",
        image_size: quality === "high" ? "2K" : "1K",
      },
    };
  } else {
    endpointTemplate = "https://api.stability.ai/v2beta/stable-image/generate/ultra";
    request = {
      prompt,
      negative_prompt: PERMANENT_EXCLUSION_BLOCK,
      aspect_ratio: "4:5",
      output_format: "png",
    };
    postprocess = {
      operation: "center-crop",
      targetAspectRatio: "3:4",
      constraint: "within-crop-safe-zone",
    };
  }

  return {
    provider,
    model: descriptor.model,
    endpointTemplate,
    request,
    requiredSecrets: [...descriptor.requiredSecrets],
    ...(postprocess ? { postprocess } : {}),
    safety: {
      executionEnabled: false,
      networkAllowed: false,
      credentialsIncluded: false,
      imageGenerated: false,
    },
  };
}

export function estimateWeeklyCost(
  provider: CoverImageProviderId,
  mediumConcepts = 3,
  highFinals = 1,
): number {
  if (!Number.isInteger(mediumConcepts) || mediumConcepts < 0 || !Number.isInteger(highFinals) || highFinals < 0) {
    throw new Error("Render counts must be non-negative integers");
  }
  const rate = PROVIDER_CATALOG[provider].estimatedUsd;
  return Number((mediumConcepts * rate.mediumConcept + highFinals * rate.highFinal).toFixed(3));
}

export function buildOpenAIProductionRequest(prompt: string): Record<string, unknown> {
  requireText(prompt, "prompt");
  return {
    model: OPENAI_COVER_CONFIG.model,
    prompt,
    size: OPENAI_COVER_CONFIG.size,
    quality: OPENAI_COVER_CONFIG.quality,
    output_format: OPENAI_COVER_CONFIG.outputFormat,
    n: OPENAI_COVER_CONFIG.imageCount,
  };
}

export function coverStoragePath(draftId: string, generationId: string): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(draftId) || !uuid.test(generationId)) throw new Error("draftId and generationId must be UUIDs");
  return `private/${draftId}/${generationId}/master.png`;
}

export function buildProductionCoverPreview(concept: CoverConcept): Record<string, unknown> {
  const audit = auditCoverConcept(concept);
  if (!audit.passed) throw new Error(`Concept audit failed: ${audit.failures.join(", ")}`);
  return {
    readOnly: true,
    productionSupabaseCalled: false,
    providerInvoked: false,
    imageGenerated: false,
    issueNumber: concept.issueNumber,
    issueTitle: concept.issueTitle,
    editorialThesis: concept.editorialThesis,
    themeConfidence: concept.themeConfidence,
    themeType: concept.themeType,
    compositionFamily: concept.compositionFamily,
    centralEditorialTension: concept.centralTension,
    heroObject: concept.heroObject,
    supportingForms: concept.supportingForms,
    controlledImpossibility: concept.controlledImpossibility,
    unresolvedState: concept.unresolvedState,
    palette: concept.palette,
    dominantAccent: concept.palette.accent
      ? `${concept.palette.accent} at ${concept.palette.accentPercent}%`
      : null,
    supportedInterpretation: concept.supportedInterpretation,
    prohibitedImplications: concept.claimsNotImply,
    exactFinalPrompt: concept.prompt,
    exactNegativeExclusionPrompt: PERMANENT_EXCLUSION_BLOCK,
    cropPlan: concept.cropPlan,
    expectedProviderParameters: buildOpenAIProductionRequest(concept.prompt),
    expectedCostUsd: OPENAI_COVER_CONFIG.estimatedCostUsd,
    artBibleVersion: ART_BIBLE.version,
    artBibleSha256: ART_BIBLE_SHA256,
    promptVersion: COVER_PROMPT_VERSION,
    audit,
  };
}

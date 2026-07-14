export type JsonSchema = Record<string, unknown>;

export interface JsonSchemaAudit {
  objectNodes: number;
  everyObjectClosed: boolean;
  requiredFields: number;
  optionalFields: number;
  unionTypeFields: number;
  anyOfUses: number;
  oneOfUses: number;
  allOfUses: number;
  nestingDepth: number;
  enumCount: number;
  enumValues: number;
  unsupportedKeywords: string[];
  formatKeywords: string[];
  constraints: Record<string, number>;
  arraysWithOptionalObjectFields: number;
  definitions: number;
  duplicatedDefinitions: number;
  unnecessaryNesting: number;
}

const CONSTRAINT_KEYWORDS = [
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "pattern",
  "minItems",
  "maxItems",
  "uniqueItems",
  "minProperties",
  "maxProperties",
] as const;

function editorialArticleSchema(): JsonSchema {
  return {
    type: "object",
    properties: {
      candidateId: { type: "string" },
      headline: { type: "string" },
      summary: { type: "string" },
      takeaway: { type: "string" },
      limitations: { type: "string" },
      evidenceLabel: { type: "string", enum: ["High", "Moderate", "Preliminary", "Limited"] },
    },
    required: ["candidateId", "headline", "summary", "takeaway", "limitations", "evidenceLabel"],
    additionalProperties: false,
  };
}

function themeEvidenceSchema(): JsonSchema {
  return {
    type: "object",
    properties: {
      candidateId: { type: "string" },
      sourcePhrase: { type: "string" },
    },
    required: ["candidateId", "sourcePhrase"],
    additionalProperties: false,
  };
}

/** Compact structured output; exact article counts and IDs are enforced after parsing. */
export function buildEditorialSchema(): JsonSchema {
  return {
    type: "object",
    properties: {
      editorialThesis: { type: "string" },
      themeConfidence: { type: "string", enum: ["high", "medium", "low"] },
      themeType: {
        type: "string",
        enum: [
          "scientific-tension",
          "decision-problem",
          "population-or-life-stage",
          "trade-off",
          "systems-relationship",
          "evidence-limitation",
          "no-unifying-theme",
        ],
      },
      themeKeywords: {
        type: "array",
        items: { type: "string" },
      },
      themeEvidence: {
        type: "array",
        items: themeEvidenceSchema(),
      },
      issueTitle: { type: "string" },
      cover: editorialArticleSchema(),
      briefs: {
        type: "array",
        items: editorialArticleSchema(),
      },
      pharmacistNote: { type: "string" },
    },
    required: [
      "editorialThesis",
      "themeConfidence",
      "themeType",
      "themeKeywords",
      "themeEvidence",
      "issueTitle",
      "cover",
      "briefs",
      "pharmacistNote",
    ],
    additionalProperties: false,
  };
}

export function buildMinimalDiagnosticSchema(): JsonSchema {
  return {
    type: "object",
    properties: { value: { type: "string" } },
    required: ["value"],
    additionalProperties: false,
  };
}

function objectValue(value: unknown): JsonSchema | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonSchema
    : null;
}

export function auditJsonSchema(schema: JsonSchema): JsonSchemaAudit {
  const audit: JsonSchemaAudit = {
    objectNodes: 0,
    everyObjectClosed: true,
    requiredFields: 0,
    optionalFields: 0,
    unionTypeFields: 0,
    anyOfUses: 0,
    oneOfUses: 0,
    allOfUses: 0,
    nestingDepth: 0,
    enumCount: 0,
    enumValues: 0,
    unsupportedKeywords: [],
    formatKeywords: [],
    constraints: {},
    arraysWithOptionalObjectFields: 0,
    definitions: 0,
    duplicatedDefinitions: 0,
    unnecessaryNesting: 0,
  };
  const unsupported = new Set<string>();
  const formats = new Set<string>();
  const definitionValues: string[] = [];

  const visit = (raw: unknown, depth: number, parentIsArray = false): void => {
    const node = objectValue(raw);
    if (!node) return;
    audit.nestingDepth = Math.max(audit.nestingDepth, depth);
    const type = node.type;
    if (Array.isArray(type)) audit.unionTypeFields += 1;
    if (Array.isArray(node.anyOf)) audit.anyOfUses += 1;
    if (Array.isArray(node.oneOf)) audit.oneOfUses += 1;
    if (Array.isArray(node.allOf)) audit.allOfUses += 1;
    if (Array.isArray(node.enum)) {
      audit.enumCount += 1;
      audit.enumValues += node.enum.length;
    }
    if (typeof node.format === "string") formats.add(node.format);
    for (const keyword of CONSTRAINT_KEYWORDS) {
      if (!(keyword in node)) continue;
      audit.constraints[keyword] = (audit.constraints[keyword] ?? 0) + 1;
      unsupported.add(keyword);
    }

    const properties = objectValue(node.properties);
    if (type === "object" || properties) {
      audit.objectNodes += 1;
      if (node.additionalProperties !== false) audit.everyObjectClosed = false;
      const propertyNames = properties ? Object.keys(properties) : [];
      const required = new Set(Array.isArray(node.required) ? node.required.filter((item): item is string => typeof item === "string") : []);
      audit.requiredFields += required.size;
      const optionalCount = propertyNames.filter((name) => !required.has(name)).length;
      audit.optionalFields += optionalCount;
      if (parentIsArray && optionalCount > 0) audit.arraysWithOptionalObjectFields += 1;
      for (const child of Object.values(properties ?? {})) visit(child, depth + 1);
    }

    if (type === "array" && node.items) visit(node.items, depth + 1, true);
    for (const keyword of ["anyOf", "oneOf", "allOf"] as const) {
      if (Array.isArray(node[keyword])) for (const child of node[keyword]) visit(child, depth + 1);
    }
    for (const keyword of ["$defs", "definitions"] as const) {
      const definitions = objectValue(node[keyword]);
      if (!definitions) continue;
      audit.definitions += Object.keys(definitions).length;
      for (const child of Object.values(definitions)) {
        definitionValues.push(JSON.stringify(child));
        visit(child, depth + 1);
      }
    }
  };

  visit(schema, 1);
  const definitionCounts = new Map<string, number>();
  for (const value of definitionValues) definitionCounts.set(value, (definitionCounts.get(value) ?? 0) + 1);
  audit.duplicatedDefinitions = [...definitionCounts.values()].reduce(
    (count, occurrences) => count + Math.max(0, occurrences - 1),
    0,
  );
  audit.unsupportedKeywords = [...unsupported].sort();
  audit.formatKeywords = [...formats].sort();
  return audit;
}

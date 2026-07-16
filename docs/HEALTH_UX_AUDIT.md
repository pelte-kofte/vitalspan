# Phase 2 — Health UX audit

## Baseline

The previous Health entry point was the biomarker catalogue (`BiomarkerDetailScreen`): a dark, dense list organised by laboratory category. It made the user scan individual numbers before understanding what those numbers meant together.

## Findings

| Finding | User impact | Phase 2 decision |
| --- | --- | --- |
| Category and biomarker lists lead the screen | High cognitive load; no answer to “how am I doing?” | Lead with Health Overview, then body systems |
| Longevity targets were visually mixed with laboratory values | Feels untrustworthy and can imply a universal “optimal” result | Keep source-lab reference, clinical significance, longevity evidence, and research-only content separate |
| Status language such as optimal/suboptimal/critical was too absolute | Suggests diagnosis or treatment promise | Use neutral range and trend language |
| Dark dashboard styling, many pills, and saturated chart colors | Feels like a monitoring console rather than a calm health record | Use a warm editorial canvas, quiet rules, one accent, and progressive disclosure |
| Historical charts were visible before context and provenance | Encourages over-reading noise and hides collection/source details | Summarise direction first; open a chart on demand |
| Empty and partial data states were implicit | Users cannot tell what Vitalspan knows, what it cannot know, or what to do next | Give every input state an explicit knowledge / uncertainty / next-action explanation |
| The tab label “Biomarkers” describes storage, not the user's goal | Misaligned mental model | Rename the entry point to Health |
| Icon sources were mixed between generic symbols and medical motifs | Inconsistent visual language and poor small-size recognition | Use one custom monochrome SVG glyph family |

## What disappears completely

- The biomarker catalogue as the first screen.
- Universal longevity “optimal” labels presented as clinical truth.
- A chart-first summary.
- Emoji, random SF Symbols, and colourful medical clip-art.
- Unqualified treatment recommendations in the Health surface.

## Success criteria

Within five seconds, a user can find the blood phenotypic age (or an honest “not enough data” state), latest laboratory date, completeness, trend, and the body system that needs attention. A system detail then progressively discloses the measurements, provenance, ranges, evidence, limitations, and actions.


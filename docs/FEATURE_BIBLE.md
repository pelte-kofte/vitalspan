# FEATURE BIBLE

## Purpose

This document defines every core capability of Vitalspan.

While the Product Bible explains why the product exists and the Screen Bible explains how users experience it, the Feature Bible defines what the product is capable of.

Every feature should have a single responsibility.

Every new capability should be documented here before implementation.

The Feature Bible serves as the single source of truth for all product capabilities.

---

## How to Use This Document

Every feature should follow the same structure to ensure consistency across the product.

Each feature defines:

- Purpose
- User Question
- Problem
- Scientific Foundation
- Inputs
- Processing
- Outputs
- User Experience
- AI Behavior
- Premium Rules
- Dependencies
- Appears In
- Success Criteria
- Future Expansion
- Anti Goals

No implementation details should live here.

This document defines product behavior, not engineering implementation.

---

# PART I — CORE USER FEATURES

These are the capabilities users directly experience.

1. Biological Age
2. Health Score
3. Health Domains

4. Recovery
5. Metabolic Health
6. Cardiovascular Health
7. Physical Fitness
8. Nutrition
9. Mental Wellbeing
10. Longevity

11. Goals
12. Health Plans
13. AI Health Advisor
14. Learn
15. Reports

---

# PART II — PLATFORM FEATURES

These systems power the user experience but are not products by themselves.

16. Biomarker Engine
17. Apple Health Integration
18. Wearables Integration
19. Laboratory Integration
20. Trend Engine
21. Recommendation Engine
22. AI Personalization
23. Confidence Engine
24. Notification Engine
25. Sync Engine
26. Premium System

---

# PART III — FUTURE FEATURES

These capabilities align with the long-term product vision.

• DNA Integration
• Continuous Glucose Monitoring (CGM)
• Family Health
• Doctor Portal
• Longevity Forecasting
• Voice Health Coach
• Clinical Reports
• Environmental Health
• Cognitive Health
• API Platform

# 1. BIOLOGICAL AGE

## Purpose

Biological Age is the flagship feature of Vitalspan.

Its purpose is to transform complex health information into a single understandable indicator of long-term health.

Rather than replacing individual health metrics,

Biological Age summarizes how the body is aging based on multiple health dimensions.

It should motivate users through understanding,

not fear.

---

## User Question

"How healthy is my body compared to my chronological age?"

---

## Problem

Most users cannot interpret dozens of biomarkers,

sleep metrics,

activity measurements,

or lifestyle indicators.

Biological Age simplifies this complexity into a meaningful long-term signal while encouraging deeper exploration.

---

## Scientific Foundation

Biological Age is an estimation,

not a diagnosis.

It should combine evidence-based health indicators into an interpretable model.

The methodology should remain transparent at a high level,

while allowing the underlying model to evolve over time.

Users should understand that Biological Age is influenced by lifestyle,

not destiny.

---

## Inputs

The Biological Age model may incorporate:

• Laboratory biomarkers

• Sleep quality

• Physical activity

• Cardiovascular health

• Body composition

• Nutrition

• Recovery

• Lifestyle habits

• Future validated health signals

The model should gracefully adapt when some inputs are unavailable.

---

## Processing

Vitalspan should normalize available health information,

evaluate long-term patterns,

and estimate Biological Age using continuously improving models.

Missing data should reduce confidence,

not prevent calculation whenever reasonable estimation remains possible.

---

## Outputs

The feature should produce:

• Estimated Biological Age

• Difference from chronological age

• Confidence level

• Major contributing factors

• Positive contributors

• Areas for improvement

• Long-term trend

• Personalized explanation

Outputs should prioritize understanding over precision.

---

## User Experience

Users should immediately understand:

• Their current Biological Age

• Whether it is improving

• Why it has changed

• Which factors matter most

The experience should encourage curiosity,

not anxiety.

---

## AI Behavior

AI should explain:

• Why Biological Age changed

• Which behaviors contributed

• Which improvements would have the greatest impact

• How confidence is determined

AI should avoid deterministic language or guarantees.

---

## Premium Rules

Free users receive:

• Current Biological Age

• Basic explanation

• High-level trend

Premium users additionally receive:

• Detailed factor analysis

• Long-term projections

• Scenario simulations

• Advanced AI interpretation

• Personalized optimization strategies

Premium should deepen understanding,

not simply unlock numbers.

---

## Dependencies

Biological Age depends on:

• Apple Health integration

• Biomarker data

• Health domain calculations

• AI interpretation engine

• Trend analysis engine

---

## Appears In

Today

Health

Plan

Learn

Reports

AI Advisor

Widgets

Notifications

---

## Success Criteria

Users should:

• Understand what Biological Age represents.

• Trust the explanation.

• Feel motivated to improve.

• Return to monitor long-term progress.

The feature succeeds when it encourages healthier behavior,

not obsessive checking.

---

## Future Expansion

Potential future capabilities include:

• Multiple Biological Age models

• Organ-specific biological ages

• Longevity forecasting

• Intervention simulations

• Clinical validation partnerships

The feature should evolve alongside advances in longevity science.

---

## Anti Goals

Biological Age should never:

• Be presented as a medical diagnosis.

• Guarantee future outcomes.

• Encourage fear or comparison.

• Hide uncertainty.

• Reward unhealthy optimization behaviors.

The feature exists to educate,

guide,

and motivate long-term health improvement.

# 2. HEALTH SCORE

## Purpose

Health Score provides a simple, daily snapshot of the user's overall health status.

Unlike Biological Age, which reflects long-term health, Health Score reflects how the user is doing today based on the latest available information.

It exists to help users quickly understand whether they are moving in the right direction.

---

## User Question

"How am I doing today?"

---

## Problem

Users often have dozens of health signals but struggle to understand their current overall condition.

Health Score combines multiple health domains into a single, easy-to-understand indicator that supports daily decision making.

---

## Scientific Foundation

Health Score is a dynamic wellness indicator rather than a medical assessment.

It should combine validated health domains using transparent weighting that can evolve as scientific evidence improves.

Health Score should be responsive to meaningful lifestyle changes while avoiding excessive sensitivity to normal day-to-day variation.

---

## Inputs

Health Score may consider:

• Sleep

• Recovery

• Activity

• Nutrition

• Heart Health

• Biomarkers

• Lifestyle habits

• Stress indicators

• Future validated health metrics

The score should gracefully adapt when some data sources are unavailable.

---

## Processing

Vitalspan should evaluate each health domain,

calculate a weighted contribution,

and produce an overall Health Score together with explanations of the strongest positive and negative influences.

Daily noise should be smoothed to avoid misleading fluctuations.

---

## Outputs

The feature should provide:

• Overall Health Score

• Trend over time

• Domain contributions

• Positive contributors

• Areas needing attention

• Confidence level

• Personalized explanation

The score should always be accompanied by meaningful context.

---

## User Experience

Users should understand:

• Whether today's score is improving or declining.

• Which health domains influenced the score.

• What they can do to improve it.

The score should encourage healthy habits rather than competition.

---

## AI Behavior

AI should explain:

• Why the score changed.

• Which behaviors had the greatest influence.

• Which actions are likely to improve tomorrow's score.

AI should always explain before recommending.

---

## Premium Rules

Free users receive:

• Current score

• Basic explanation

• Short-term trend

Premium users additionally receive:

• Detailed domain analysis

• Predictive score forecasting

• Scenario simulations

• Advanced coaching

• Personalized optimization recommendations

Premium should increase understanding rather than simply exposing more numbers.

---

## Dependencies

Health Score depends on:

• Health Domains

• Apple Health Integration

• Biomarker Engine

• Trend Engine

• AI Interpretation

---

## Appears In

Today

Health

Plan

Reports

Widgets

Notifications

AI Advisor

---

## Success Criteria

Users should:

• Instantly understand today's overall health.

• Know which factors matter most.

• Feel motivated to improve tomorrow's score.

• View the score as a guide rather than a judgment.

---

## Future Expansion

Potential future capabilities include:

• Adaptive weighting

• Personalized scoring models

• Clinical validation

• Population benchmarking (optional)

• Goal-specific Health Scores

---

## Anti Goals

Health Score should never:

• Replace Biological Age.

• Function as a diagnosis.

• Encourage unhealthy competition.

• Overreact to normal daily variation.

• Become a gamified metric without meaning.

The score should support understanding,

motivation,

and sustainable behavior change.

# 3. HEALTH DOMAINS

## Purpose

Health Domains organize the user's health into meaningful areas rather than isolated measurements.

They provide the structural foundation for Health Score,

Biological Age,

AI insights,

and personalized recommendations.

Instead of presenting disconnected metrics,

Health Domains tell the story of how different aspects of health contribute to overall wellbeing.

---

## User Question

"Which areas of my health are doing well, and which need attention?"

---

## Problem

Health data is naturally fragmented.

Users receive sleep scores,

heart rate,

steps,

blood tests,

weight,

and many other measurements without understanding how they relate to each other.

Health Domains organize these signals into understandable categories that support better decision making.

---

## Scientific Foundation

Each Health Domain represents a broader physiological system rather than an individual metric.

A domain may incorporate multiple data sources,

clinical indicators,

behavioral patterns,

and longitudinal trends.

Domains should evolve as medical evidence improves while maintaining stable user understanding.

---

## Core Domains

The initial Health Domains include:

• Recovery

• Metabolic Health

• Cardiovascular Health

• Physical Fitness

• Nutrition

• Mental Wellbeing

• Longevity

Additional domains may be introduced as the product evolves.

---

## Inputs

Each domain combines relevant information from multiple sources,

including Apple Health,

wearables,

laboratory biomarkers,

manual logs,

questionnaires,

and future supported integrations.

No single metric should define an entire domain.

---

## Processing

Vitalspan should calculate each domain independently using evidence-informed models,

then combine domain outcomes to support Biological Age,

Health Score,

AI recommendations,

and personalized coaching.

---

## Outputs

Each domain should provide:

• Current status

• Trend

• Confidence level

• Contributing factors

• Positive contributors

• Areas needing improvement

• Personalized explanation

• Suggested next actions

Users should understand both the current state and the reasons behind it.

---

## User Experience

Users should easily identify:

• Strongest health domains.

• Weakest health domains.

• Which domains are improving.

• Which domains deserve attention.

Domain information should encourage exploration rather than overwhelm users.

---

## AI Behavior

AI should connect information across domains.

Examples include:

• Poor recovery reducing cardiovascular performance.

• Nutrition influencing metabolic health.

• Sleep improving Biological Age.

AI should explain relationships,

not isolated metrics.

---

## Premium Rules

Free users receive:

• Domain overview

• Basic trends

• Simple explanations

Premium users additionally receive:

• Deep domain analysis

• Cross-domain insights

• Personalized optimization

• Predictive forecasting

• Advanced coaching

Premium should increase understanding,

not complexity.

---

## Dependencies

Health Domains depend on:

• Apple Health Integration

• Biomarkers

• Wearables

• Manual Tracking

• AI Interpretation

• Trend Engine

---

## Appears In

Today

Health

Plan

Learn

Reports

Widgets

Notifications

AI Advisor

---

## Success Criteria

Users should:

• Understand the major areas of their health.

• Know which domain deserves attention.

• Understand why a domain changes.

• Feel empowered to improve specific areas.

Health Domains should become the user's primary mental model for understanding health.

---

## Future Expansion

Future capabilities may include:

• Organ-specific domains

• Women's health

• Cognitive health

• Immune health

• Environmental health

• Genetic risk integration

The domain architecture should remain flexible while preserving simplicity.

---

## Anti Goals

Health Domains should never:

• Become collections of unrelated metrics.

• Duplicate individual measurements.

• Overlap excessively.

• Require medical expertise to understand.

• Compete with Biological Age or Health Score.

Domains should simplify health,

not complicate it.

# 4. RECOVERY

## Product Importance

★★★★★

## Development Phase

MVP

---

## Purpose

Recovery represents the body's ability to restore, repair, and prepare itself for future physical and mental performance.

Rather than measuring a single metric, Recovery combines multiple physiological signals into one understandable health domain.

Its purpose is to help users understand whether their body is ready to perform, adapt, or rest.

---

## User Question

"How well has my body recovered?"

---

## Problem

Most users rely on isolated measurements such as sleep duration or resting heart rate without understanding their combined impact.

Recovery transforms multiple physiological signals into one clear picture of the body's readiness and resilience.

---

## Why It Matters

Recovery influences nearly every aspect of health.

Poor recovery may reduce:

• Physical performance

• Mental performance

• Immune function

• Mood

• Energy

• Long-term health

Improving recovery often produces improvements across multiple Health Domains.

---

## Primary Signals

Recovery may consider:

• Sleep Duration

• Sleep Consistency

• Sleep Efficiency

• Resting Heart Rate

• Heart Rate Variability (HRV)

• Respiratory Rate

• Previous Physical Activity

• Stress Indicators

• Illness Detection Signals

• Future validated recovery metrics

No single metric should dominate the Recovery calculation.

---

## Processing

Vitalspan should evaluate each recovery signal,

normalize available information,

identify long-term patterns,

and estimate overall Recovery using evidence-informed models.

Short-term fluctuations should be balanced with historical trends to avoid unnecessary volatility.

---

## Outputs

Recovery should provide:

• Recovery Status

• Recovery Trend

• Confidence Level

• Strongest Positive Contributors

• Strongest Negative Contributors

• Personalized Explanation

• Recommended Actions

• Estimated Impact on Overall Health

Recovery should explain the reasons behind the result,

not simply provide a score.

---

## User Experience

Users should immediately understand:

• Whether they are well recovered.

• Why Recovery changed.

• What influenced today's Recovery.

• Which actions would most improve Recovery tomorrow.

The experience should encourage healthy decisions,

not perfection.

---

## AI Behavior

AI should explain:

• Why Recovery changed.

• Which physiological signals contributed most.

• Which behaviors are improving Recovery.

• Which behaviors are reducing Recovery.

• Which recommendation would have the greatest positive impact.

AI should always explain relationships,

not isolated metrics.

---

## Health Score Contribution

Recovery is one of the major contributors to the overall Health Score.

Short-term Recovery changes may influence daily Health Score more than Biological Age.

---

## Biological Age Contribution

Consistently strong Recovery should positively influence Biological Age over time.

Temporary Recovery fluctuations should have only limited impact on long-term Biological Age.

---

## Premium Rules

Free users receive:

• Current Recovery

• Basic explanation

• Short-term trend

Premium users additionally receive:

• Deep Recovery analysis

• Recovery forecasting

• Personalized optimization

• AI coaching

• Cross-domain Recovery insights

Premium should increase understanding,

not complexity.

---

## Dependencies

Recovery depends on:

• Apple Health Integration

• Wearables Integration

• Biomarker Engine

• Trend Engine

• AI Personalization

---

## Appears In

Today

Health

Plan

Reports

AI Advisor

Widgets

Notifications

---

## Success Criteria

Users should:

• Understand today's Recovery.

• Know why Recovery changed.

• Feel confident improving Recovery.

• Build sustainable habits that improve long-term resilience.

Recovery succeeds when users make healthier decisions rather than simply chasing higher scores.

---

## Future Expansion

Potential future capabilities include:

• Recovery Forecasting

• Jet Lag Recovery

• Travel Recovery

• Illness Detection

• Recovery Readiness

• Personalized Recovery Protocols

• Environmental Recovery Factors

Recovery should continuously become more personalized as additional health signals become available.

---

## Anti Goals

Recovery should never:

• Be based on a single metric.

• Encourage obsessive daily checking.

• Ignore long-term trends.

• Replace medical evaluation.

• Punish occasional poor sleep or stressful days.

Recovery exists to help users understand,

adapt,

and improve—not to judge them.

# 5. METABOLIC HEALTH

## Product Importance

★★★★★

## Development Phase

MVP

---

## Purpose

Metabolic Health represents the body's ability to efficiently produce, store, and use energy while maintaining healthy regulation of blood sugar, body composition, and metabolic function.

Rather than focusing on individual laboratory values or body weight, Metabolic Health evaluates the body's overall metabolic resilience.

Its purpose is to help users understand one of the strongest drivers of long-term health and longevity.

---

## User Question

"How healthy is my metabolism?"

---

## Problem

Many users only monitor body weight or isolated biomarkers without understanding the broader picture of metabolic health.

Healthy metabolism depends on multiple interacting factors including glucose regulation, body composition, nutrition, physical activity, and lifestyle.

Metabolic Health combines these signals into one understandable domain.

---

## Why It Matters

Strong Metabolic Health supports:

• Stable energy

• Healthy body composition

• Reduced chronic disease risk

• Better cardiovascular health

• Improved recovery

• Healthy aging

Poor metabolic health may develop gradually without noticeable symptoms.

Helping users understand these trends early encourages preventive action.

---

## Primary Signals

Metabolic Health may consider:

• Fasting Glucose

• HbA1c

• Fasting Insulin

• Body Fat Percentage

• Waist Circumference

• BMI (supporting only)

• Weight Trend

• Nutrition Quality

• Physical Activity

• Future validated metabolic biomarkers

No individual measurement should define overall Metabolic Health.

---

## Processing

Vitalspan should evaluate metabolic signals over time,

identify meaningful trends,

normalize available information,

and estimate overall Metabolic Health using evidence-informed models.

Temporary fluctuations should not significantly alter long-term assessment.

---

## Outputs

Metabolic Health should provide:

• Current Status

• Trend

• Confidence Level

• Positive Contributors

• Areas Needing Attention

• Personalized Explanation

• Recommended Actions

• Estimated Health Impact

Users should understand both their current metabolic condition and the reasons behind it.

---

## User Experience

Users should immediately understand:

• Whether their metabolism is improving.

• Which behaviors have the greatest influence.

• Which biomarkers deserve attention.

• Which actions are most likely to improve metabolic health.

The experience should promote sustainable habits rather than weight obsession.

---

## AI Behavior

AI should explain:

• Which lifestyle habits influence metabolic health.

• How nutrition affects biomarkers.

• Why body composition matters.

• Which interventions are expected to have the highest impact.

AI should focus on long-term health rather than short-term weight changes.

---

## Health Score Contribution

Metabolic Health is a major contributor to overall Health Score.

Consistent improvements should positively influence daily health assessment.

---

## Biological Age Contribution

Long-term improvements in Metabolic Health should contribute meaningfully to healthier Biological Age.

Temporary dietary changes should have limited long-term influence unless sustained.

---

## Premium Rules

Free users receive:

• Current Metabolic Health

• Basic explanation

• Trend overview

Premium users additionally receive:

• Detailed metabolic analysis

• AI-powered optimization strategies

• Biomarker interpretation

• Long-term forecasting

• Cross-domain insights

Premium should deepen understanding,

not simply expose additional numbers.

---

## Dependencies

Metabolic Health depends on:

• Biomarker Engine

• Apple Health Integration

• Laboratory Integration

• Trend Engine

• AI Personalization

---

## Appears In

Today

Health

Plan

Reports

AI Advisor

Learn

---

## Success Criteria

Users should:

• Understand their metabolic health.

• Recognize meaningful long-term trends.

• Know which habits matter most.

• Feel motivated to improve sustainably.

The feature succeeds when users make healthier lifestyle decisions rather than focusing only on body weight.

---

## Future Expansion

Potential future capabilities include:

• Continuous Glucose Monitoring (CGM)

• Personalized nutrition guidance

• Meal response prediction

• Insulin sensitivity estimation

• Advanced metabolic flexibility analysis

As scientific evidence evolves, Metabolic Health should become increasingly personalized.

---

## Anti Goals

Metabolic Health should never:

• Focus only on weight.

• Encourage crash dieting.

• Reward rapid short-term changes.

• Ignore long-term behavioral patterns.

• Function as a medical diagnosis.

Metabolic Health exists to promote sustainable lifestyle improvement through understanding and education.

# 6. CARDIOVASCULAR HEALTH

## Product Importance

★★★★★

## Development Phase

MVP

---

## Purpose

Cardiovascular Health represents the overall condition, efficiency, and resilience of the heart and circulatory system.

Rather than focusing on isolated measurements, it evaluates how the cardiovascular system performs over time using multiple physiological indicators.

Its purpose is to help users understand one of the strongest predictors of long-term health and longevity.

---

## User Question

"How healthy is my heart?"

---

## Problem

Most people only pay attention to cardiovascular health after problems appear.

Vitalspan helps users recognize positive trends and early warning signs before they become meaningful health risks.

---

## Why It Matters

Healthy cardiovascular function supports:

• Longevity

• Physical performance

• Brain health

• Recovery

• Energy

• Disease prevention

Improving cardiovascular health benefits nearly every other health domain.

---

## Primary Signals

Cardiovascular Health may consider:

• Resting Heart Rate

• Heart Rate Variability

• Blood Pressure

• VO₂ Max

• Cardio Fitness

• Walking Heart Rate

• Activity Levels

• Laboratory Biomarkers

• Future validated cardiovascular metrics

No single signal should determine cardiovascular health.

---

## Processing

Vitalspan should combine cardiovascular indicators,

evaluate long-term trends,

and estimate overall cardiovascular condition using evidence-informed models.

Temporary fluctuations should have limited influence unless they become persistent.

---

## Outputs

• Current Status

• Trend

• Confidence Level

• Positive Contributors

• Areas Needing Attention

• Personalized Explanation

• Recommended Actions

• Estimated Long-Term Impact

---

## User Experience

Users should understand:

• Whether cardiovascular health is improving.

• Which behaviors influence heart health.

• Which measurements deserve attention.

• Which actions will likely provide the greatest benefit.

---

## AI Behavior

AI should explain relationships between:

Activity

Recovery

Nutrition

Blood Pressure

VO₂ Max

Heart Rate

Rather than describing numbers individually,

AI should explain how these factors work together.

---

## Health Score Contribution

Cardiovascular Health is a major contributor to Health Score.

---

## Biological Age Contribution

Consistently healthy cardiovascular function should positively influence Biological Age over time.

---

## Premium Rules

Premium includes:

• Advanced cardiovascular analysis

• Personalized coaching

• Long-term projections

• Cross-domain insights

• AI explanations

---

## Dependencies

• Apple Health

• Biomarker Engine

• Trend Engine

• AI Personalization

---

## Appears In

Today

Health

Plan

Learn

Reports

AI Advisor

---

## Success Criteria

Users should understand:

• Their current cardiovascular condition.

• Why it changes.

• How to improve it sustainably.

---

## Future Expansion

• ECG Support

• Arrhythmia Insights

• Clinical Risk Models

• Advanced Blood Pressure Trends

• Heart Disease Prevention Programs

---

## Anti Goals

Cardiovascular Health should never:

• Cause unnecessary anxiety.

• Replace medical diagnosis.

• Focus on isolated numbers.

• Encourage unhealthy optimization.

The goal is understanding,

not fear.

# 7. PHYSICAL FITNESS

## Product Importance

★★★★★

## Development Phase

MVP

---

## Purpose

Physical Fitness measures the body's ability to move efficiently,

generate strength,

maintain endurance,

and perform daily activities with resilience.

Its purpose is to help users build lifelong physical capacity rather than simply exercise more.

---

## User Question

"How physically fit am I?"

---

## Problem

Many people confuse exercise volume with physical fitness.

Physical Fitness reflects overall functional capability,

not simply time spent exercising.

---

## Why It Matters

Strong physical fitness improves:

• Longevity

• Mobility

• Metabolic Health

• Cardiovascular Health

• Mental Wellbeing

• Independence during aging

---

## Primary Signals

• Daily Activity

• Weekly Exercise

• VO₂ Max

• Walking Pace

• Step Count

• Strength Training Frequency

• Mobility Assessments

• Future validated fitness metrics

---

## Processing

Vitalspan evaluates physical activity patterns,

exercise consistency,

functional capacity,

and long-term improvements.

Fitness should reward consistency rather than occasional intense workouts.

---

## Outputs

• Fitness Status

• Trend

• Confidence

• Positive Contributors

• Weak Areas

• Personalized Recommendations

• Long-Term Progress

---

## User Experience

Users should understand:

• Whether they are becoming fitter.

• Which habits matter most.

• Which improvements are realistic.

---

## AI Behavior

AI should recommend sustainable improvements,

never unrealistic exercise plans.

---

## Health Score Contribution

Physical Fitness contributes significantly to Health Score.

---

## Biological Age Contribution

Long-term improvements in fitness should positively influence Biological Age.

---

## Premium Rules

Premium includes:

• Advanced fitness analysis

• Personalized progression plans

• Adaptive coaching

• Long-term forecasting

---

## Dependencies

• Apple Health

• Trend Engine

• AI Personalization

---

## Appears In

Today

Health

Plan

Reports

AI Advisor

---

## Success Criteria

Users should become stronger,

more active,

and more consistent over time.

---

## Future Expansion

• Strength Estimation

• Functional Age

• Mobility Scoring

• Personalized Training Plans

---

## Anti Goals

Physical Fitness should never:

• Reward overtraining.

• Encourage unhealthy competition.

• Judge users by activity alone.

The goal is lifelong movement,

not short-term performance.


# 13. AI HEALTH ADVISOR

## Product Importance

★★★★★

## Development Phase

MVP

---

## Purpose

AI Health Advisor is the intelligence layer of Vitalspan.

Its purpose is to transform health data into meaningful understanding,

personalized recommendations,

and long-term guidance.

Rather than replacing healthcare professionals,

AI Health Advisor helps users better understand their own health,

make informed lifestyle decisions,

and stay motivated over time.

The advisor should feel like a trusted health coach,

not a chatbot.

---

## User Question

"What does all of this mean for me?"

---

## Problem

Modern health platforms generate enormous amounts of data.

Most users cannot connect laboratory values,

sleep,

activity,

nutrition,

recovery,

and lifestyle into one understandable picture.

AI Health Advisor exists to explain,

prioritize,

and personalize.

---

## Why It Matters

Health information without interpretation creates confusion.

AI should transform measurements into understanding,

understanding into action,

and action into long-term healthy habits.

The advisor is the primary mechanism through which Vitalspan delivers ongoing value.

---

## Responsibilities

AI Health Advisor should:

• Explain health data.

• Connect information across multiple domains.

• Recommend the next best action.

• Answer health questions.

• Teach scientific concepts simply.

• Celebrate progress.

• Encourage sustainable habits.

AI should always simplify complexity.

---

## Knowledge Sources

The advisor may use:

• User health data.

• Biological Age.

• Health Score.

• Health Domains.

• Biomarkers.

• Lifestyle information.

• Apple Health.

• Laboratory data.

• Scientific evidence.

• User preferences.

Every response should combine personal context with trusted scientific knowledge.

---

## Reasoning Principles

Before generating any recommendation,

AI should evaluate:

• Current health status.

• Long-term trends.

• User goals.

• Available health data.

• Confidence level.

• Scientific evidence.

Recommendations should always prioritize the highest-impact opportunity.

---

## Communication Principles

AI should be:

Empathetic.

Evidence-informed.

Calm.

Encouraging.

Transparent.

Honest.

Never dramatic.

Never judgmental.

Never fear-based.

Users should feel understood,

not evaluated.

---

## Recommendation Principles

Every recommendation should answer:

Why?

Why now?

Expected benefit?

Estimated effort?

Expected timeframe?

Alternative options?

Recommendations should always feel achievable.

---

## Learning Behavior

The advisor should continuously help users understand:

• Why biomarkers matter.

• Why health changes.

• Why recommendations change.

• How healthy habits work.

Every conversation should increase health literacy.

---

## Health Boundaries

AI must never:

• Diagnose diseases.

• Replace physicians.

• Guarantee outcomes.

• Recommend unsafe interventions.

• Hide uncertainty.

Whenever appropriate,

AI should clearly communicate uncertainty and recommend professional care.

---

## Personalization

Recommendations should adapt based on:

• User history.

• Health goals.

• Progress.

• Preferences.

• Available devices.

• Laboratory results.

• Behavior patterns.

Personalization should continuously improve over time.

---

## Premium Rules

Free users receive:

• Basic explanations.

• Simple recommendations.

• Limited conversations.

Premium users receive:

• Unlimited conversations.

• Deep health analysis.

• Long-term coaching.

• Personalized health planning.

• Advanced interpretation.

• Predictive insights.

Premium should increase intelligence,

not simply remove limits.

---

## Dependencies

AI Health Advisor depends on nearly every major platform capability,

including:

• Biological Age

• Health Score

• Health Domains

• Biomarker Engine

• Apple Health

• Trend Engine

• Recommendation Engine

• AI Personalization

• Scientific Knowledge Base

---

## Appears In

Today

Health

Plan

Learn

Reports

Notifications

Widgets

Dedicated AI Chat

---

## Success Criteria

Users should:

• Better understand their health.

• Trust the explanations.

• Feel motivated to improve.

• Return regularly for guidance.

The advisor succeeds when users consistently make healthier decisions because they better understand themselves.

---

## Future Expansion

Future capabilities may include:

• Voice conversations.

• Proactive coaching.

• Family health coaching.

• Clinical summaries.

• Preventive health simulations.

• Doctor collaboration.

• Personalized longevity coaching.

The advisor should evolve into the central intelligence layer of the Vitalspan ecosystem.

---

## Anti Goals

AI Health Advisor should never:

• Feel like a search engine.

• Overwhelm users with scientific terminology.

• Generate unnecessary fear.

• Pretend certainty where uncertainty exists.

• Encourage obsessive health tracking.

• Replace medical professionals.

The advisor exists to educate,

guide,

and empower users throughout their lifelong health journey.
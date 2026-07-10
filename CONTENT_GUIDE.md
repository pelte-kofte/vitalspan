# Content Guide — "The Vitalspan Brief"

> How to publish a new weekly issue of the Articles tab. No code changes, no app
> release — everything below is a SQL statement pasted into the **Supabase SQL
> editor**, the same workflow already used for `src/db/seed_exercises.sql` and
> `src/db/seed_biomarker_definitions.sql`.

Run `src/db/create_articles_table.sql` and `src/db/create_issues_table.sql` once
per project (if you haven't already) before publishing your first issue.

---

## The shape of an issue

Conceptually, an issue is this JSON object:

```json
{
  "issueNumber": 7,
  "publishDate": "2026-07-13",
  "coverArticleId": "38812345",
  "articleIds": ["38812345", "38699012", "38701188"],
  "pharmacistNote": "This week's standout is the omega-3 index paper — if your last..."
}
```

- **`issueNumber`** — sequential integer, one higher than the last published issue. `0` is reserved for the legacy archive; never reuse it.
- **`publishDate`** — `YYYY-MM-DD`. Used for the "Issue N · date" masthead.
- **`coverArticleId`** — the PMID that becomes the front-page hero (large serif headline). Must also appear in `articleIds`.
- **`articleIds`** — every PMID in the issue, cover included, in the order they should read (cover first is conventional but not required — the app pulls the cover out by `coverArticleId` regardless of position). Aim for 3–4 total: 1 cover + 2–3 briefs ("This week in the literature" shows every non-cover id in this list).
- **`pharmacistNote`** — plain text, one or two paragraphs, in Bekir's voice. Omit (`NULL`) if there's no note this week — the section is hidden entirely when null, it never renders empty.

Every PMID referenced by `coverArticleId`/`articleIds` must exist as a row in the `articles` table **first** — see below.

---

## Step 1 — insert the articles

For each PMID in the issue, upsert its metadata into `articles`. `biomarker_tags` can be `'{}'` for editorial picks — it only mattered for the old personalized-feed ranking, which the front page no longer uses.

```sql
insert into articles (pmid, title, journal, pub_date, abstract, biomarker_tags, issue_number, section)
values
  (
    '38812345',
    'Omega-3 index and all-cause mortality: a prospective cohort analysis',
    'Nature Communications',
    '2026 Jun',
    'In this prospective cohort of 12,000 adults, a higher omega-3 index at baseline was associated with a 15% lower risk of all-cause mortality over 10 years of follow-up...',
    '{}',
    7,
    'cover'
  ),
  (
    '38699012',
    'Short-term creatine loading and cognitive performance under sleep restriction',
    'Journal of the International Society of Sports Nutrition',
    '2026 May',
    'Twenty-four healthy adults received either 20g/day creatine or placebo for 5 days prior to 24 hours of sleep deprivation...',
    '{}',
    7,
    'brief'
  ),
  (
    '38701188',
    'Vitamin D repletion and hsCRP: a meta-analysis of RCTs',
    'European Journal of Clinical Nutrition',
    '2026 Apr',
    'Pooled data from 14 randomized controlled trials (n=3,102) found a modest but statistically significant reduction in hsCRP with vitamin D repletion above 30 ng/mL...',
    '{}',
    7,
    'brief'
  )
on conflict (pmid) do update set
  title          = excluded.title,
  journal        = excluded.journal,
  pub_date       = excluded.pub_date,
  abstract       = excluded.abstract,
  biomarker_tags = excluded.biomarker_tags,
  issue_number   = excluded.issue_number,
  section        = excluded.section;
```

**`section`** is one of:

| Value | Meaning |
|---|---|
| `cover` | The one hero article for the issue — must match `coverArticleId` below. |
| `brief` | A "This week in the literature" card. |
| `note` | Reserved for a future case where the pharmacist's note is itself a structured article row instead of plain text. Not used today — `pharmacistNote` (Step 2) covers this. Leave `section` off entirely (`NULL`) unless you have a specific reason to use it. |

`section` is informational/denormalized — the app resolves an issue's articles from `issues.article_ids`, not by querying `section`. Set it anyway so the data is self-describing if you ever query `articles` directly.

---

## Step 2 — insert the issue

```sql
insert into issues (issue_number, publish_date, cover_article_id, article_ids, pharmacist_note)
values (
  7,
  '2026-07-13',
  '38812345',
  array['38812345', '38699012', '38701188'],
  'This week''s standout is the omega-3 index paper — if your last omega-3 index came back under 8%, this is worth a read before your next fish-oil refill. Note the effect size is modest; this supports a habit, it doesn''t replace one.'
)
on conflict (issue_number) do update set
  publish_date      = excluded.publish_date,
  cover_article_id   = excluded.cover_article_id,
  article_ids        = excluded.article_ids,
  pharmacist_note     = excluded.pharmacist_note;
```

That's it — the app reads the highest `issue_number` greater than `0` as "the current issue" automatically. Publishing issue 8 next week retires issue 7 to "Past issues" with zero extra steps.

**Escaping apostrophes in the note:** double them (`'`  →  `''`), as shown above (`This week''s`, `it doesn''t`) — standard Postgres string escaping.

---

## Editing or correcting a published issue

Both `insert` statements above use `on conflict ... do update`, so re-running Step 1 and/or Step 2 with the same `pmid` / `issue_number` and corrected values is safe — it overwrites in place rather than erroring or duplicating.

## Un-publishing an issue

Don't delete the row — a deleted `issue_number` that's still referenced by `articles.issue_number` (foreign key) will fail. If an issue needs to be pulled, either fix its content in place (see above) or leave it in the archive; there's no "unlisted" state today.

## The legacy archive (Issue 0)

`issue_number = 0` is a synthetic issue created by the `create_issues_table.sql` migration to hold every article that existed before the issue system (from the old personalized biomarker-feed fetcher in `src/lib/articleService.ts`). It has no cover story and no pharmacist's note by design — it appears in "Past issues" as **Archive**. You never need to touch it; new content always goes in a new, incrementing `issue_number`.

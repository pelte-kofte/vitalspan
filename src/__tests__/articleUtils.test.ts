import {
  articleCategory,
  articleDeck,
  formatStudyType,
  splitEditorialArticle,
} from '../lib/articleUtils';

describe('Brief editorial presentation helpers', () => {
  it('separates the published summary and takeaway contract', () => {
    expect(splitEditorialArticle('Results were promising.\n\nWhy it matters: This changes the research question.')).toEqual({
      summary: 'Results were promising.',
      whyItMatters: 'This changes the research question.',
    });
  });

  it('preserves legacy abstracts as key findings', () => {
    expect(splitEditorialArticle('A legacy abstract.')).toEqual({
      summary: 'A legacy abstract.',
      whyItMatters: null,
    });
  });

  it('uses one deterministic takeaway sentence for the contents deck', () => {
    expect(articleDeck('Summary.\n\nWhy it matters: First sentence. More context follows.')).toBe('First sentence.');
  });

  it('humanizes study types and topics without changing stored data', () => {
    expect(formatStudyType('systematic_review')).toBe('Systematic Review');
    expect(articleCategory(['cognitive-aging'], 'randomized_trial')).toBe('Cognitive Aging');
    expect(articleCategory([], 'randomized_trial')).toBe('Randomized Trial');
  });

  it('handles absent article copy safely', () => {
    expect(splitEditorialArticle(null)).toEqual({ summary: '', whyItMatters: null });
    expect(articleDeck(null)).toBeNull();
  });
});

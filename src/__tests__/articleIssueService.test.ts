const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockFrom = jest.fn((table: string) => ({
  select: jest.fn(() => table === 'issues'
    ? { order: mockOrder }
    : { eq: mockEq, in: mockIn }),
}));

jest.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}));

import {
  clearIssueServiceCache,
  loadAllIssues,
  loadIssueWithArticles,
} from '../lib/issueService';

const issueOne = {
  issue_number: 1,
  publish_date: '2026-07-22',
  cover_article_id: '100',
  article_ids: ['100', '101'],
  pharmacist_note: 'Reviewed note',
};

describe('published article issue loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearIssueServiceCache();
    mockOrder.mockResolvedValue({ data: [issueOne], error: null });
    mockIn.mockResolvedValue({
      data: [
        { pmid: '100', title: 'Cover' },
        { pmid: '101', title: 'Brief' },
      ],
      error: null,
    });
    mockEq.mockResolvedValue({ data: [], error: null });
  });

  test('caches the issue index and resolved issue until explicit refresh', async () => {
    const firstIndex = await loadAllIssues();
    const first = await loadIssueWithArticles(1, false, firstIndex[0]);
    const secondIndex = await loadAllIssues();
    const second = await loadIssueWithArticles(1, false, secondIndex[0]);

    expect(first?.coverArticle?.pmid).toBe('100');
    expect(first?.briefArticles.map(article => article.pmid)).toEqual(['101']);
    expect(second).toBe(first);
    expect(mockOrder).toHaveBeenCalledTimes(1);
    expect(mockIn).toHaveBeenCalledTimes(1);
  });

  test('explicit refresh performs one new index read and one new article read', async () => {
    const initialIndex = await loadAllIssues();
    await loadIssueWithArticles(1, false, initialIndex[0]);

    const refreshedIndex = await loadAllIssues(true);
    await loadIssueWithArticles(1, true, refreshedIndex[0]);

    expect(mockOrder).toHaveBeenCalledTimes(2);
    expect(mockIn).toHaveBeenCalledTimes(2);
  });

  test('distinguishes an empty published set from a read failure', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });
    await expect(loadAllIssues()).resolves.toEqual([]);

    clearIssueServiceCache();
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'network unavailable' } });
    await expect(loadAllIssues()).rejects.toThrow('network unavailable');
  });
});

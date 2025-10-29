import { ContentModerationService } from './moderation';

// Mock external libs used by moderation to make tests deterministic
jest.mock('bad-words', () => {
  return jest.fn().mockImplementation(() => ({ isProfane: (s: string) => /badword/i.test(s) }));
});
jest.mock('natural', () => ({
  SentimentAnalyzer: jest.fn().mockImplementation(() => ({ getSentiment: () => 0 })),
  PorterStemmer: { stem: (t: string) => t },
  WordTokenizer: jest.fn().mockImplementation(() => ({ tokenize: (t: string) => t.split(/\s+/) })),
}));

describe('ContentModerationService', () => {
  const service = new ContentModerationService();

  it('approves simple clean content', async () => {
    const res = await service.checkContent('Hello everyone');
    expect(res.isApproved).toBe(true);
    expect(res.reasons.length).toBe(0);
  });

  it('flags profanity and spam keywords', async () => {
    const res = await service.checkContent('This is a badword, buy now!');
    expect(res.isApproved).toBe(false);
    expect(res.reasons).toEqual(expect.arrayContaining(['Contains profanity', 'Contains spam keywords']));
    expect(res.confidence).toBeLessThan(1);
  });

  it('flags excessive capitalization', async () => {
    const res = await service.checkContent('THIS IS SHOUTING TEXT');
    expect(res.reasons).toEqual(expect.arrayContaining(['Excessive capitalization']));
  });
});



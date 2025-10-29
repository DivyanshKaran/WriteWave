import { EpubExtractorService } from './epub-extractor.service';

// Mock external modules
jest.mock('epub-parser', () => ({ parse: jest.fn(async (_fp: string) => ({
  title: 'Test Book',
  author: 'Author',
  chapters: [
    { html: '<html><body>今日は良い天気です。漢字を学ぶ。</body></html>' },
    { html: '<html><body>学ぶことは楽しい。勉強する。</body></html>' },
  ],
})) }));

jest.mock('node-html-parser', () => ({ parse: (html: string) => ({ text: html.replace(/<[^>]+>/g, '') }) }));

// Mock CharacterService inside the class by monkey-patching after instantiation

describe('EpubExtractorService', () => {
  it('extracts kanji and produces sorted unique list', async () => {
    const service = new EpubExtractorService();
    // patch characterService methods used in enrichment/save steps
    (service as any).characterService = {
      getCharacterByCharacter: jest.fn(async () => null),
      updateCharacter: jest.fn(),
      createCharacter: jest.fn(async (d: any) => ({ id: 'k1', ...d })),
    };

    const res = await service.extractKanjiFromEpub('/fake.epub');
    expect(res.title).toBe('Test Book');
    expect(res.uniqueKanji.length).toBeGreaterThan(0);
    // ensure sorted by frequency desc
    for (let i = 1; i < res.uniqueKanji.length; i++) {
      expect(res.uniqueKanji[i-1].frequency).toBeGreaterThanOrEqual(res.uniqueKanji[i].frequency);
    }
  });

  it('full pipeline processes and saves kanji', async () => {
    const service = new EpubExtractorService();
    (service as any).characterService = {
      getCharacterByCharacter: jest.fn(async () => null),
      updateCharacter: jest.fn(),
      createCharacter: jest.fn(async (d: any) => ({ id: 'k1', ...d })),
    };

    const out = await service.processEpubFile('/fake.epub');
    expect(out.extractionResult.title).toBe('Test Book');
    expect(out.enrichedKanji.length).toBeGreaterThan(0);
    expect(out.savedKanji.length).toBeGreaterThanOrEqual(out.enrichedKanji.length);
    expect(out.kanjiPagesData.length).toBe(out.enrichedKanji.length);
  });
});



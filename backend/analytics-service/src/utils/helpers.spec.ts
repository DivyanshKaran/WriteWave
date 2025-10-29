import {
  calculatePercentage,
  calculateGrowthRate,
  calculateMovingAverage,
  calculatePercentile,
  formatBytes,
  formatDuration,
  formatPercentage,
  isValidEmail,
  isValidUrl,
  parseDate,
  getDateRange,
  groupBy,
  sortBy,
  chunk,
  unique,
  clamp,
  normalize,
  denormalize,
} from './helpers';

describe('utils/helpers', () => {
  it('percentages and growth rate', () => {
    expect(calculatePercentage(25, 100)).toBeCloseTo(0.25);
    expect(calculatePercentage(1, 0)).toBe(0);
    expect(calculateGrowthRate(200, 100)).toBe(100);
    expect(calculateGrowthRate(0, 0)).toBe(0);
  });

  it('moving average and percentile', () => {
    expect(calculateMovingAverage([1,2,3,4,5], 3)).toEqual([2,3,4]);
    expect(calculatePercentile([1,2,3,4,5], 80)).toBe(4);
  });

  it('formatting helpers', () => {
    expect(formatBytes(1024)).toContain('KB');
    expect(formatDuration(65)).toBe('1m 5s');
    expect(formatPercentage(0.1234, 1)).toBe('12.3%');
  });

  it('validators and date parsing', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(parseDate('2020-01-01')).not.toBeNull();
  });

  it('date range returns plausible values', () => {
    const { start, end } = getDateRange('week');
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it('array/object utilities', () => {
    const grouped = groupBy([{k: 'a'}, {k: 'b'}, {k: 'a'}] as any, 'k');
    expect(Object.keys(grouped)).toEqual(expect.arrayContaining(['a','b']));
    const sorted = sortBy([{n:2},{n:1}] as any, 'n', 'asc');
    expect(sorted[0].n).toBe(1);
    expect(chunk([1,2,3,4], 2)).toEqual([[1,2],[3,4]]);
    expect(unique([1,1,2])).toEqual([1,2]);
  });

  it('math helpers', () => {
    expect(clamp(5, 1, 3)).toBe(3);
    const n = normalize(5, 0, 10);
    expect(n).toBeCloseTo(0.5);
    expect(denormalize(n, 0, 10)).toBeCloseTo(5);
  });
});



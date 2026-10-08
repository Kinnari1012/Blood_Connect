import { describe, it, expect } from 'vitest';
import { MatchingService } from '../src/services/matching.service';

describe('MatchingService.calculateNextEligibleDate', () => {
  it('adds exactly the configured gap days', () => {
    const last = new Date('2024-01-01');
    const next = MatchingService.calculateNextEligibleDate(last, 90);
    const diff = Math.round((next.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(90);
  });

  it('works with a 60 day gap', () => {
    const last = new Date('2024-06-01');
    const next = MatchingService.calculateNextEligibleDate(last, 60);
    const diff = Math.round((next.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(60);
  });
});

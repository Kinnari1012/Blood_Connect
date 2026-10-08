import { describe, it, expect } from 'vitest';
import { BLOOD_COMPATIBILITY, BLOOD_GROUP_DISPLAY } from '../src/types';

describe('Blood compatibility', () => {
  it('O- can donate to all groups', () => {
    const allGroups = Object.keys(BLOOD_COMPATIBILITY);
    for (const group of allGroups) {
      expect(BLOOD_COMPATIBILITY[group]).toContain('O_NEG');
    }
  });

  it('AB+ can receive from all groups', () => {
    const allGroups = Object.keys(BLOOD_COMPATIBILITY);
    expect(BLOOD_COMPATIBILITY['AB_POS'].length).toBe(allGroups.length);
  });

  it('A- can only receive from A- and O-', () => {
    expect(BLOOD_COMPATIBILITY['A_NEG']).toEqual(['A_NEG', 'O_NEG']);
  });

  it('O+ cannot receive from A, B, or AB', () => {
    const oPosCompatible = BLOOD_COMPATIBILITY['O_POS'];
    expect(oPosCompatible).not.toContain('A_POS');
    expect(oPosCompatible).not.toContain('B_POS');
    expect(oPosCompatible).not.toContain('AB_POS');
  });
});

describe('Blood group display names', () => {
  it('displays A_POS as A+', () => {
    expect(BLOOD_GROUP_DISPLAY['A_POS']).toBe('A+');
  });
  it('displays O_NEG as O-', () => {
    expect(BLOOD_GROUP_DISPLAY['O_NEG']).toBe('O-');
  });
  it('displays AB_POS as AB+', () => {
    expect(BLOOD_GROUP_DISPLAY['AB_POS']).toBe('AB+');
  });
});

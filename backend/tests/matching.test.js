const { calculateMatchScore } = require('../services/matchingService');

describe('matchingService.calculateMatchScore', () => {
  const make = (offered, wanted) => ({
    skillsOffered: offered.map((name) => ({ name, verified: false })),
    skillsWanted: wanted.map((name) => ({ name })),
  });

  it('gives a high score to a perfect mutual match', () => {
    const a = make(['React'], ['Guitar']);
    const b = make(['Guitar'], ['React']);
    expect(calculateMatchScore(a, b)).toBe(100);
  });

  it('gives zero when there is no overlap', () => {
    const a = make(['React'], ['Guitar']);
    const b = make(['Cooking'], ['Welding']);
    expect(calculateMatchScore(a, b)).toBe(0);
  });

  it('is case-insensitive on skill names', () => {
    const a = make(['react'], ['guitar']);
    const b = make(['GUITAR'], ['REACT']);
    expect(calculateMatchScore(a, b)).toBe(100);
  });

  it('adds a bonus for verified skills the other user wants', () => {
    const a = { skillsOffered: [], skillsWanted: [{ name: 'React' }] };
    const bPlain = { skillsOffered: [{ name: 'React', verified: false }], skillsWanted: [] };
    const bVerified = { skillsOffered: [{ name: 'React', verified: true }], skillsWanted: [] };
    expect(calculateMatchScore(a, bVerified)).toBeGreaterThan(calculateMatchScore(a, bPlain));
  });

  it('never exceeds 100', () => {
    const a = make(['React', 'Node'], ['Guitar', 'Piano']);
    const b = {
      skillsOffered: [
        { name: 'Guitar', verified: true },
        { name: 'Piano', verified: true },
      ],
      skillsWanted: [{ name: 'React' }, { name: 'Node' }],
    };
    expect(calculateMatchScore(a, b)).toBeLessThanOrEqual(100);
  });
});

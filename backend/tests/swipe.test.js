/**
 * tests/swipe.test.js
 * Covers the swipe deck: feed exclusion, pass/like, and mutual-match detection.
 */
const { app, request, registerUser, auth } = require('./helpers');

describe('Swipes', () => {
  test('feed excludes self and already-swiped users', async () => {
    const a = await registerUser();
    const b = await registerUser();

    // A's feed should contain B and never A.
    let res = await request(app).get('/api/swipes/feed').set(auth(a.token));
    expect(res.status).toBe(200);
    const ids = res.body.feed.map((f) => f.user._id);
    expect(ids).toContain(b.user._id);
    expect(ids).not.toContain(a.user._id);

    // After A passes on B, B disappears from A's feed.
    await request(app).post('/api/swipes').set(auth(a.token))
      .send({ targetId: b.user._id, action: 'pass' });

    res = await request(app).get('/api/swipes/feed').set(auth(a.token));
    expect(res.body.feed.map((f) => f.user._id)).not.toContain(b.user._id);
  });

  test('a one-sided like is not a match', async () => {
    const a = await registerUser();
    const b = await registerUser();

    const res = await request(app).post('/api/swipes').set(auth(a.token))
      .send({ targetId: b.user._id, action: 'like' });

    expect(res.status).toBe(200);
    expect(res.body.match).toBe(false);
  });

  test('mutual likes create a match visible to both users', async () => {
    const a = await registerUser();
    const b = await registerUser();

    // B likes A first (one-sided, no match yet).
    await request(app).post('/api/swipes').set(auth(b.token))
      .send({ targetId: a.user._id, action: 'like' });

    // A likes B back → match.
    const res = await request(app).post('/api/swipes').set(auth(a.token))
      .send({ targetId: b.user._id, action: 'like' });
    expect(res.body.match).toBe(true);
    expect(res.body.user._id).toBe(b.user._id);
    expect(res.body.chatRoom).toMatch(/^match_/);

    // Both see the match on their matches list.
    const aMatches = await request(app).get('/api/swipes/matches').set(auth(a.token));
    const bMatches = await request(app).get('/api/swipes/matches').set(auth(b.token));
    expect(aMatches.body.matches.map((m) => m.user._id)).toContain(b.user._id);
    expect(bMatches.body.matches.map((m) => m.user._id)).toContain(a.user._id);
  });

  test('rejects an invalid action', async () => {
    const a = await registerUser();
    const b = await registerUser();
    const res = await request(app).post('/api/swipes').set(auth(a.token))
      .send({ targetId: b.user._id, action: 'maybe' });
    expect(res.status).toBe(400);
  });
});

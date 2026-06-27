const { app, request, registerUser, auth } = require('./helpers');

describe('Swap lifecycle', () => {
  it('matches two complementary users via /api/users/match', async () => {
    const { token: tokenA } = await registerUser({
      skillsOffered: [{ name: 'React', level: 'expert' }],
      skillsWanted: [{ name: 'Guitar', level: 'beginner' }],
    });
    await registerUser({
      skillsOffered: [{ name: 'Guitar', level: 'expert' }],
      skillsWanted: [{ name: 'React', level: 'beginner' }],
    });

    const res = await request(app).get('/api/users/match').set(auth(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.matches.length).toBeGreaterThanOrEqual(1);
    expect(res.body.matches[0].matchScore).toBeGreaterThan(0);
  });

  it('runs a full request → accept → complete flow and awards credits', async () => {
    const { token: tokenA } = await registerUser({
      skillsOffered: [{ name: 'React' }], skillsWanted: [{ name: 'Guitar' }],
    });
    const { token: tokenB, user: userB } = await registerUser({
      skillsOffered: [{ name: 'Guitar' }], skillsWanted: [{ name: 'React' }],
    });

    // A requests a swap with B.
    const reqRes = await request(app).post('/api/swaps/request').set(auth(tokenA)).send({
      receiverId: userB._id,
      requesterSkill: 'React',
      receiverSkill: 'Guitar',
      message: 'Lets swap!',
    });
    expect(reqRes.status).toBe(201);
    const swapId = reqRes.body.swap._id;
    expect(reqRes.body.swap.status).toBe('pending');

    // B accepts.
    const accRes = await request(app).put(`/api/swaps/${swapId}/accept`).set(auth(tokenB));
    expect(accRes.status).toBe(200);
    expect(accRes.body.swap.status).toBe('accepted');

    // A completes.
    const compRes = await request(app).put(`/api/swaps/${swapId}/complete`).set(auth(tokenA));
    expect(compRes.status).toBe(200);
    expect(compRes.body.swap.status).toBe('completed');

    // Both users earned 30 credits (100 welcome + 30).
    const meA = await request(app).get('/api/auth/me').set(auth(tokenA));
    const meB = await request(app).get('/api/auth/me').set(auth(tokenB));
    expect(meA.body.user.creditBalance).toBe(130);
    expect(meB.body.user.creditBalance).toBe(130);
    expect(meA.body.user.swapsCompleted).toBe(1);
  });

  it('forbids a non-receiver from accepting a swap', async () => {
    const { token: tokenA } = await registerUser({
      skillsOffered: [{ name: 'React' }], skillsWanted: [{ name: 'Guitar' }],
    });
    const { user: userB } = await registerUser({
      skillsOffered: [{ name: 'Guitar' }], skillsWanted: [{ name: 'React' }],
    });
    const { token: tokenC } = await registerUser();

    const reqRes = await request(app).post('/api/swaps/request').set(auth(tokenA)).send({
      receiverId: userB._id, requesterSkill: 'React', receiverSkill: 'Guitar',
    });
    const swapId = reqRes.body.swap._id;

    // C (uninvolved) tries to accept.
    const res = await request(app).put(`/api/swaps/${swapId}/accept`).set(auth(tokenC));
    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated swap request', async () => {
    const res = await request(app).post('/api/swaps/request')
      .send({ receiverId: '000000000000000000000000', requesterSkill: 'X', receiverSkill: 'Y' });
    expect(res.status).toBe(401);
  });
});

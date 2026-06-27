const { app, request, registerUser, auth } = require('./helpers');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token + welcome credits', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Ada Lovelace',
        email: 'ada@test.dev',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe('ada@test.dev');
      expect(res.body.user.creditBalance).toBe(100);
      // Password must never be returned.
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects an invalid email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ name: 'X', email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('rejects a short password', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ name: 'X', email: 'x@test.dev', password: '123' });
      expect(res.status).toBe(400);
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app).post('/api/auth/register')
        .send({ name: 'A', email: 'dup@test.dev', password: 'password123' });
      const res = await request(app).post('/api/auth/register')
        .send({ name: 'B', email: 'dup@test.dev', password: 'password123' });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      await request(app).post('/api/auth/register')
        .send({ name: 'Grace', email: 'grace@test.dev', password: 'password123' });
      const res = await request(app).post('/api/auth/login')
        .send({ email: 'grace@test.dev', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it('rejects a wrong password with 401', async () => {
      await request(app).post('/api/auth/register')
        .send({ name: 'Grace', email: 'grace2@test.dev', password: 'password123' });
      const res = await request(app).post('/api/auth/login')
        .send({ email: 'grace2@test.dev', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user with a valid token', async () => {
      const { token, user } = await registerUser();
      const res = await request(app).get('/api/auth/me').set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.user._id).toBe(user._id);
    });

    it('rejects a request with no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects a request with a malformed token', async () => {
      const res = await request(app).get('/api/auth/me').set(auth('garbage'));
      expect(res.status).toBe(401);
    });
  });
});

import request from 'supertest';

import { app } from '../app';

describe('POST /login', () => {
  it('should login a user and return a token', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', userData.email);
  });

  it('should return an error for invalid credentials', async () => {
    const userData = {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'Invalid email or password',
    );
  });
});

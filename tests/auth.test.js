const dotenv = require('dotenv');
dotenv.config();
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');

describe('AUTHENTICATION TESTS', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/auth/register', () => {
    it('should return 422 if invalid/missing input', async () => {
      const response = await request(app).post('/api/auth/register').send({
        first_name: 'Scott',
        last_name: 'Jones',
        email: 'testuser@mail.com',
      });
      expect(response.status).toBe(422);
      expect(response.body.success).toEqual(false);
    });

    it('should register a new user with a 201 status code', async () => {
      const response = await request(app).post('/api/auth/register').send({
        first_name: 'Scott',
        last_name: 'Jones',
        email: 'testuser@mail.com',
        password: 'password',
      });
      expect(response.status).toBe(201);
      expect(response.body.success).toEqual(true);
      expect(response.body.message).toEqual('User created successfully');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user).toHaveProperty(
        'email',
        'testuser@mail.com'
      );
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 if user email already exists', async () => {
      const response = await request(app).post('/api/auth/register').send({
        first_name: 'Anonymous',
        last_name: 'User',
        email: 'testuser@mail.com',
        password: 'password123',
      });
      //   console.log(response);
      expect(response.status).toBe(409);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('User already exists');
    });
  });

  it('should return 422 if password is too short', async () => {
    const response = await request(app).post('/api/auth/register').send({
      first_name: 'Alice',
      last_name: 'Wonder',
      email: 'alice@example.com',
      password: 'short',
    });
    expect(response.status).toBe(422);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toContain(
      'password length must be at least 6 characters long'
    );
  });

  describe('POST /api/auth/login', () => {
    it('should return 422 if missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@mail.com',
      });
      // console.log(response);
      expect(response.status).toBe(422);
      expect(response.body.success).toEqual(false);
    });

    it('should login a new user with a 200 status code', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@mail.com',
        password: 'password',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.message).toEqual('Log in successful');
    });

    it('should return 401 if credentials are incorrect', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@mail.com',
        password: 'password123',
      });
      expect(response.status).toBe(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Invalid login credentials');
    });
  });
});

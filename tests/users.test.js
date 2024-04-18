const dotenv = require('dotenv');
dotenv.config();
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/users.model');
const Blog = require('../src/models/blogs.model');
const { generateToken } = require('../src/utils');

describe('BLOG ROUTES TESTS', () => {
  let tokens, blogDataArray;
  let blogIds = [];

  beforeAll(async () => {
    // await connectDB();

    // Create 2 users
    const users = await Promise.all([
      User.create({
        first_name: 'Scott',
        last_name: 'Jones',
        email: 'scottyjones@mail.com',
        password: 'password123',
      }),
      User.create({
        first_name: 'Billy',
        last_name: 'Jean',
        email: 'billyjean@mail.com',
        password: 'password123',
      }),
    ]);

    tokens = users.map((user) => generateToken({ id: user._id }));

    blogDataArray = [
      {
        title: 'First Blog',
        body: 'Content of the first blog',
      },
      {
        title: 'Second Blog',
        body: 'Content of the second blog',
      },
      {
        title: 'Draft Blog',
        body: 'Content of the draft blog',
      },
    ];

    // const blog = await new Blog({
    //   title: 'Initial Blog',
    //   body: 'Content of the initial blog',
    //   author: user._id,
    // }).save();
    // blogId = blog._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    // await disconnectDB();
  });

  describe('POST /api/blogs', () => {
    it('should create new blogs', async () => {
      for (const blogData of blogDataArray) {
        const response = await request(app)
          .post('/api/blogs')
          .set('Authorization', `Bearer ${tokens[0]}`)
          .send(blogData);

        // Push the blog id into an array
        blogIds.push(response.body.data._id);

        expect(response.status).toBe(201);
        expect(response.body.data.title).toEqual(blogData.title);
        expect(response.body.data.state).toEqual('draft');
        expect(response.body.data.read_count).toEqual(0);
      }
    });
    it('should create a new blog - throw a conflict error 409', async () => {
      const blogData = {
        title: 'First Blog',
        body: 'Content of the new first blog',
      };
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${tokens[0]}`)
        .send(blogData);

      expect(response.status).toBe(409);
      expect(response.body.message).toEqual(
        'Blog with same title already exists'
      );
      expect(response.body.success).toEqual(false);
    });
  });

  describe('PATCH /api/blogs/:id', () => {
    it('should update a blog', async () => {
      const updateData = {
        title: 'Updated Blog',
        body: 'This blog has been updated with a new content.',
      };
      const response = await request(app)
        .patch(`/api/blogs/${blogIds[2]}`)
        .set('Authorization', `Bearer ${tokens[0]}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toEqual('Updated Blog');
    });
  });

  describe('PATCH /api/blogs/:id/publish', () => {
    it('should publish the first blog', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${blogIds[0]}/publish`)
        .set('Authorization', `Bearer ${tokens[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.data.state).toEqual('published');
    });
    it('should publish the second blog', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${blogIds[1]}/publish`)
        .set('Authorization', `Bearer ${tokens[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.data.state).toEqual('published');
    });
  });

  describe('GET /api/blogs', () => {
    it('should retrieve all published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ page: 1, limit: 20, order: 'desc', order_by: 'created_at' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.metadata.totalCount).toBe(2);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return a specific blog by id', async () => {
      const response = await request(app).get(`/api/blogs/${blogIds[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Successfully retrieved Blog');
      expect(response.body.data.title).toEqual(blogDataArray[0].title);
      expect(response.body.data.read_count).toEqual(1);
    });

    it('should return an error 404', async () => {
      const response = await request(app).get(`/api/blogs/${blogIds[1]}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Successfully retrieved Blog');
      expect(response.body.data.title).toEqual(blogDataArray[1].title);
      expect(response.body.data.read_count).toEqual(1);
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should delete a blog', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogIds[0]}`)
        .set('Authorization', `Bearer ${tokens[0]}`);

      expect(response.status).toBe(200);
    });
  });
});

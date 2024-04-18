const dotenv = require('dotenv');
dotenv.config();
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/users.model');
const Blog = require('../src/models/blogs.model');
const { generateToken } = require('../src/utils');

describe('BLOG ROUTES TESTS', () => {
  let token, blogId;
  const fakeBlogId = '5f0bac26a0b4a3b55d23300e';

  beforeAll(async () => {
    await connectDB();

    const [author, testUser] = await Promise.all([
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

    authorToken = generateToken({ id: author._id });
    testUserToken = generateToken({ id: testUser._id });

    const [blog, draftBlog] = await Promise.all(
      [
        {
          title: 'Initial Blog',
          body: 'This project choke, no be small. Chef cooked!',
          tags: ['Test', 'AltSchool', 'Exams'],
          author: author._id,
        },
        {
          title: 'Draft Blog',
          body: 'Content of the draft blog. We wont publish this.',
          author: author._id,
        },
      ].map((blogData) => new Blog(blogData).save())
    );

    blogId = blog._id.toString();
    draftBlogId = draftBlog._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/blogs', () => {
    it('should create a new blog', async () => {
      const blogData = {
        title: 'Test Blog Title',
        body: 'Content of the new test blog',
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authorToken}`)
        .send(blogData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toEqual('Test Blog Title');
      expect(response.body.data.state).toEqual('draft');
      expect(response.body.data.read_count).toEqual(0);
    });

    it('should return an unauthorized error 401 - not logged in user', async () => {
      const blogData = {
        title: 'Test Blog Title',
        body: 'Content of the new test blog',
        tags: ['test'],
      };
      const response = await request(app).post('/api/blogs').send(blogData);

      expect(response.status).toBe(401);
      expect(response.body.success).toEqual(false);
    });

    it('should not create a new blog if title already exists', async () => {
      const blogData = {
        title: 'Initial Blog',
        body: 'Content of the new test blog',
      };
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authorToken}`)
        .send(blogData);

      expect(response.status).toBe(409);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual(
        'Blog with same title already exists'
      );
    });

    it('should not create a new blog if title field is empty', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          body: 'Content of the new test blog',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('title is required');
    });

    it('should not create a new blog if body field is empty', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Test Blog Title',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('body is required');
    });
  });

  describe('PATCH /api/blogs/:id', () => {
    it('should return a 422 error if both title and body is empty', async () => {
      const updateData = {
        title: '',
        body: '',
      };
      const response = await request(app)
        .patch(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send(updateData);

      expect(response.status).toBe(422);
      expect(response.body.success).toEqual(false);
      // expect(response.body.message).toEqual('Blog updated successfully');
      // expect(response.body.data.title).toEqual(updateData.title);
      // expect(response.body.data.body).toEqual(updateData.body);
    });

    it('should update a blog', async () => {
      const updateData = {
        title: 'Updated Blog',
        body: 'This blog has been updated with a new content.',
      };
      const response = await request(app)
        .patch(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.message).toEqual('Blog updated successfully');
      expect(response.body.data.title).toEqual(updateData.title);
      expect(response.body.data.body).toEqual(updateData.body);
    });

    it('should update return a 401 error - unauthenticated user trying to edit a blog ', async () => {
      const updateData = {
        title: 'Updated Blog',
        body: 'This blog has been updated with a new content.',
      };
      const response = await request(app)
        .patch(`/api/blogs/${blogId}`)
        // .set('Authorization', `Bearer ${authorToken}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('You are not authorized');
    });

    it('should return a 404 error if blog does not exist', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${fakeBlogId}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Blog not found');
    });
  });

  describe('PATCH /api/blogs/:id/publish', () => {
    it('should publish a blog', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${blogId}/publish`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.data.state).toEqual('published');
    });

    it('should update return a 401 error - unauthenticated user trying to publish a blog ', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${blogId}/publish`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Not authorized to publish blog');
    });

    it('should return an error if blog does not exist', async () => {
      const response = await request(app)
        .patch(`/api/blogs/${fakeBlogId}/publish`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Blog not found');
    });
  });

  describe('GET /api/blogs', () => {
    it('should retrieve all published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ page: 1, limit: 20, order: 'desc', order_by: 'created_at' });

      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].state).not.toBe('draft');
      expect(response.body.metadata.totalCount).toBe(1);
      expect(response.body.metadata.limit).toBe(20);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return a specific blog by id', async () => {
      const response = await request(app).get(`/api/blogs/${blogId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Successfully retrieved Blog');
      expect(response.body.data.title).toEqual('Updated Blog');
      expect(response.body.data.read_count).toEqual(1);
    });

    it('should return an error 404 if blog ID is invalid', async () => {
      const response = await request(app).get(`/api/blogs/${fakeBlogId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual(
        'Blog does not exist or is not published'
      );
    });

    it('should return an error 404 if user is not author and blog is not published', async () => {
      const response = await request(app).get(`/api/blogs/${draftBlogId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual(
        'Blog does not exist or is not published'
      );
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should return a 401 error if user not the author/owner', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Not authorized to delete blog');
    });

    it('should delete a blog', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return an error if blog does not exist', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Blog not found');
    });
  });

  describe('GET /api/users/me/blogs', () => {
    it('should retrieve all blogs (published and drafts)', async () => {
      const response = await request(app)
        .get('/api/users/me/blogs')
        .set('Authorization', `Bearer ${authorToken}`)
        .query({ page: 1, limit: 20, order: 'desc', order_by: 'created_at' });

      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      // expect(response.body.data).toHaveLength(1);
      // expect(response.body.metadata.totalCount).toBe(1);
      expect(response.body.metadata.limit).toBe(20);
    });

    it('should return error is logged in user is not the author', async () => {
      const response = await request(app)
        .get('/api/users/me/blogs')
        .set('Authorization', `Bearer ${testUserToken}`)
        .query({ page: 1, limit: 20, order: 'desc', order_by: 'created_at' });

      expect(response.status).toBe(200);
      expect(response.body.success).toEqual(true);
      // expect(response.body.data).toHaveLength(1);
      // expect(response.body.metadata.totalCount).toBe(1);
      expect(response.body.metadata.limit).toBe(20);
    });
  });

  describe('Test page not found error handler ', () => {
    it('should return an error - Route does not exist)', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Route not found');
    });

    it('should return an error - Route does not exist)', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Route not found');
    });
  });
});

const express = require('express');
const blogController = require('../controllers/blog.controller');
const { asyncWrapper } = require('../utils');
const isAuthenticated = require('../middlewares/auth');

const blogRoute = express.Router();

blogRoute.get('/', asyncWrapper(blogController.getPublishedBlogs));
blogRoute.get('/:id', asyncWrapper(blogController.getBlog));
blogRoute.post('/', isAuthenticated, asyncWrapper(blogController.createBlog));
blogRoute.patch(
  '/:id',
  isAuthenticated,
  asyncWrapper(blogController.updateBlog)
);
blogRoute.patch(
  '/:id/publish',
  isAuthenticated,
  asyncWrapper(blogController.publishBlog)
);
blogRoute.delete(
  '/:id',
  isAuthenticated,
  asyncWrapper(blogController.deleteBlog)
);

module.exports = blogRoute;

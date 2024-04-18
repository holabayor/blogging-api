const express = require('express');
const blogController = require('../controllers/blog.controller');
const { asyncWrapper } = require('../utils');
const isAuthenticated = require('../middlewares/auth');

const userRoute = express.Router();

// Retrieve all blogs created by the logged-in user
userRoute.get(
  '/me/blogs',
  isAuthenticated,
  asyncWrapper(blogController.getAllBlogs)
);

module.exports = userRoute;

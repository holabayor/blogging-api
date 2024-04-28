const blogService = require('./../services/blog.service');
const {
  blogUpdateSchema,
  createBlogSchema,
  queryParamSchema,
  paramIdSchema,
} = require('../middlewares/validators.schema');
const { validate } = require('../utils');
const { ResourceNotFound } = require('../middlewares/errors');

const getBlog = async (req, res) => {
  const { id } = validate(paramIdSchema, req.params);

  const data = await blogService.getBlogById(id);
  if (data) {
    return res
      .status(200)
      .json({ success: true, message: 'Successfully retrieved Blog', data });
  }
  throw new ResourceNotFound('Blog post not found');
};

const getAllBlogs = async (req, res) => {
  const values = validate(queryParamSchema, req.query);
  const { page, limit, order, order_by } = values;

  const { state } = req.query;

  // console.log('Requesting user is ', req.user);
  const authorId = req.user.id;

  const { blogs, totalCount } = await blogService.getAllBlogs(
    page,
    limit,
    order,
    order_by,
    state,
    authorId
  );

  const totalPages = Math.ceil(totalCount / limit);
  const metadata = {
    page: page,
    limit: limit,
    totalPages: totalPages,
    totalCount: totalCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };

  const message = totalPages ? 'Blogs retrieval successful' : 'No blogs found';

  return res.status(200).json({
    success: true,
    message,
    data: blogs,
    metadata,
  });
};

const getPublishedBlogs = async (req, res) => {
  const values = validate(queryParamSchema, req.query);
  const { page, limit, order, orderBy } = values;

  const { author, title, tags } = req.query;
  const searchParams = req.query.q;

  const { blogs, totalCount } = await blogService.getAllPublishedBlogs(
    page,
    limit,
    order,
    orderBy,
    searchParams
  );

  const totalPages = Math.ceil(totalCount / limit);
  const metadata = {
    page: page,
    limit: limit,
    totalPages: totalPages,
    totalCount: totalCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };

  const message = totalPages ? 'Blogs retrieval successful' : 'No blogs found';

  return res.status(200).json({
    success: true,
    message,
    data: blogs,
    metadata,
  });
};

const createBlog = async (req, res) => {
  validate(createBlogSchema, req.body);

  const data = await blogService.createBlog(req.user.id, req.body);
  if (data)
    return res
      .status(201)
      .json({ success: true, message: 'Blog created successfully', data });
};

const updateBlog = async (req, res) => {
  const { id } = validate(paramIdSchema, req.params);
  validate(blogUpdateSchema, req.body);

  const data = await blogService.updateBlog(id, req.user.id, req.body);
  if (data)
    return res
      .status(200)
      .json({ success: true, message: 'Blog updated successfully', data });
};

const publishBlog = async (req, res) => {
  const { id } = validate(paramIdSchema, req.params);
  const data = await blogService.publishBlog(id, req.user.id);
  if (data) {
    return res
      .status(200)
      .json({ success: true, message: 'Blog published successfully', data });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = validate(paramIdSchema, req.params);
  const data = await blogService.deleteBlog(id, req.user.id);
  if (data) {
    return res.status(204).json({});
  }
};

module.exports = {
  getBlog,
  getAllBlogs,
  getPublishedBlogs,
  createBlog,
  updateBlog,
  publishBlog,
  deleteBlog,
};

const Blog = require('../models/blogs.model');
const User = require('../models/users.model');
const {
  ResourceNotFound,
  Unauthorized,
  Conflict,
} = require('../middlewares/errors');

const getBlogById = async (id) => {
  const blog = await Blog.findOneAndUpdate(
    { _id: id, state: 'published' },
    { $inc: { read_count: 1 } },
    { new: true }
  ).populate('author');
  if (!blog)
    throw new ResourceNotFound('Blog does not exist or is not published');
  return blog;
};

const getAllBlogs = async (page, limit, order, order_by, state, authorId) => {
  const query = { author: authorId };
  const skip = (page - 1) * limit;

  if (state) {
    query.state = state;
  }

  const blogs = await Blog.find(query)
    .populate('author')
    .skip(skip)
    .limit(limit)
    .sort([[order_by, order]]);
  const totalCount = await Blog.countDocuments(query);
  return { blogs, totalCount };
};

const getAllPublishedBlogs = async (
  page,
  limit,
  order,
  order_by,
  searchParams
) => {
  const query = { state: 'published' };
  const skip = (page - 1) * limit;

  // Extending the query parameters to include the search functionalities
  // I'm using regex to match the search parameters whilst ignoring the case sensitivity
  if (searchParams) {
    if (searchParams.title) {
      query.title = { $regex: new RegExp(searchParams.title, 'i') };
    }
    if (searchParams.tags) {
      query.tags = { $in: new RegExp(searchParams.tags, 'i') };
    }
    if (searchParams.author) {
      const authorIds = await User.find({
        $or: [
          { first_name: { $regex: new RegExp(searchParams.author, 'i') } },
          { last_name: { $regex: new RegExp(searchParams.author, 'i') } },
        ],
      }).select('_id');
      query.author = { $in: authorIds.map((author) => author._id) };
    }
  }

  // console.log(query);
  const blogs = await Blog.find(query)
    .populate('author')
    .skip(skip)
    .limit(limit)
    .sort([[order_by, order]]);
  const totalCount = await Blog.countDocuments(query);
  return { blogs, totalCount };
};

const createBlog = async (authorId, payload) => {
  try {
    const blog = await new Blog({ ...payload, author: authorId }).populate(
      'author'
    );
    await blog.save();
    return blog;
  } catch (err) {
    // console.log(err);
    if (err.code === 11000) {
      throw new Conflict('Blog with same title already exists');
    }
    throw new Error('Something went wrong');
  }
};

const updateBlog = async (blogId, authorId, payload) => {
  const blogExists = await Blog.findById(blogId);
  if (!blogExists) throw new ResourceNotFound('Blog not found');

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, author: authorId },
    { $set: payload },
    { new: true }
  ).populate('author');

  if (!blog) throw new Unauthorized('Not authorized to update this blog');
  return blog;
};

const publishBlog = async (blogId, authorId) => {
  const blogExists = await Blog.findById(blogId);
  if (!blogExists) throw new ResourceNotFound('Blog not found');

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, author: authorId },
    { $set: { state: 'published' } },
    { new: true }
  ).populate('author');

  if (!blog) throw new Unauthorized('Not authorized to publish blog');
  return blog;
};

const deleteBlog = async (blogId, authorId) => {
  const blogExists = await Blog.findById(blogId);
  if (!blogExists) throw new ResourceNotFound('Blog not found');

  const blog = await Blog.findOneAndDelete({
    _id: blogId,
    author: authorId,
  }).populate('author');
  if (!blog) throw new Unauthorized('Not authorized to delete blog');

  return blog;
};

module.exports = {
  getBlogById,
  getAllBlogs,
  getAllPublishedBlogs,
  createBlog,
  updateBlog,
  publishBlog,
  deleteBlog,
};

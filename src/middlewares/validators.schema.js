const Joi = require('joi');

const paramIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required().messages({
    'string.base': 'Invalid Id',
    'string.length': 'Invalid Id',
    'string.hex': 'Invalid Id',
  }),
});

// USER/AUTH SCHEMAS

const signupSchema = Joi.object({
  first_name: Joi.string().min(3).required(),
  last_name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// BLOG SCHEMAS

const createBlogSchema = Joi.object({
  title: Joi.string().min(4).required(),
  description: Joi.string().min(4),
  body: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string()),
});

const blogUpdateSchema = Joi.object({
  title: Joi.string().min(4),
  description: Joi.string().min(4),
  body: Joi.string().min(10),
  tags: Joi.array().items(Joi.string()),
});

const queryParamSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).default(20).optional(),
  order_by: Joi.string()
    .valid('created_at', 'updated_at', 'title', 'read_count', 'reading_time')
    .default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  author: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  title: Joi.string().trim().optional(),
  tags: Joi.string().trim().optional(),
});

module.exports = {
  paramIdSchema,
  signupSchema,
  loginSchema,
  createBlogSchema,
  blogUpdateSchema,
  queryParamSchema,
};

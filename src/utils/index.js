const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Forbidden, InvalidInput } = require('../middlewares/errors');

// Function to hash a password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Function to compare a password with its hash using bcrypt
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Function to generate a JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1hr' }); // Token expires in 1 hour
};

// Function to verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    throw new Forbidden('Invalid or expired token');
  }
};

// Function to validate user input against the schema
const validate = (schema, data) => {
  if (schema) {
    const { error, value } = schema.validate(data);
    if (error) {
      const errorMessage = error.details[0].message;
      throw new InvalidInput(errorMessage);
    }
    return value;
  }
};

// Function that calculate the average reading time for a blog post
const getReadingTime = (blogContent) => {
  const totalWords = blogContent.split(' ').length;
  // Assume that it takes 1 minute to read 40 words
  return Math.ceil(totalWords / 40);
};

// An asynchronous wrapper - high order function for the controllers
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  asyncWrapper,
  getReadingTime,
  validate,
};

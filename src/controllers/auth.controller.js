const authService = require('./../services/auth.service');
const {
  loginSchema,
  signupSchema,
} = require('../middlewares/validators.schema');
const { validate } = require('../utils');

const signup = async (req, res) => {
  validate(signupSchema, req.body);

  const user = await authService.createUser(req.body);
  if (user)
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
};

const login = async (req, res) => {
  validate(loginSchema, req.body);

  const { email, password } = req.body;

  const data = await authService.login(email, password);
  if (data) {
    return res
      .status(200)
      .json({ success: true, message: 'Log in successful', data });
  }
};

module.exports = { signup, login };

const { verifyToken } = require('../utils');
const { Unauthorized } = require('./errors');

const isAuthenticated = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Unauthorized('You are not authorized');

    const payload = verifyToken(token);
    // Set the user object to empty if no current user
    if (!req.user) req.user = {};
    req.user.id = payload.id;
    next();
  } catch (error) {
    // Pass any thrown errors to the global error handler
    next(error);
  }
};

module.exports = isAuthenticated;

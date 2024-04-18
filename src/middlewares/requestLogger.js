const { logger } = require('../config/logger');

const requestLogger = (req, res, next) => {
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      status: res.statusCode,
      user: req.user ? req.user.id : 'Guest',
    });
  });
  //   console.log(Object.keys(res));

  next();
};

module.exports = requestLogger;

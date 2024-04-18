const express = require('express');
const routes = require('./routes');
const { errorHandler, routeNotFound } = require('./middlewares/errors');
const requestLogger = require('./middlewares/requestLogger');

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', routes.authRoute);
app.use('/api/blogs', routes.blogRoute);
app.use('/api/users', routes.userRoute);

// Error handling middlewares
app.use(errorHandler);
app.use(routeNotFound);

module.exports = app;

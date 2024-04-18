const express = require('express');
const routes = require('./routes');
const { errorHandler, routeNotFound } = require('./middlewares/errors');

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/auth', routes.authRoute);
app.use('/api/blogs', routes.blogRoute);
app.use('/api/users', routes.userRoute);

// Error handling middlewares
app.use(errorHandler);
app.use(routeNotFound);

module.exports = app;

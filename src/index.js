const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const redisClient = require('./integrations/redis');

// Initialize express app
const port = parseInt(process.env.PORT || '8900');

// Create server
const server = http.createServer(app);

// Connect to the redis client
redisClient.connect();

// Start application with DB connection
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`⚡️Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

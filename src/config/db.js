const { default: mongoose } = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB
const connectDB = async () => {
  let mongodbUri = process.env.MONGODB_URI;

  // Define mock database connection for testing purposes
  if (process.env.NODE_ENV === 'test') {
    mongoServer = await MongoMemoryServer.create();
    mongodbUri = mongoServer.getUri();
  }

  if (!mongodbUri) {
    console.error('MongoDB URI not found in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbUri);

    console.log('🚀 Connected to MongoDB');
  } catch (error) {
    console.error('❌Failed to connect to MongoDB');
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌Failed to disconnect from MongoDB');
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};

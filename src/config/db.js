const { default: mongoose } = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB
const connectDB = async () => {
  let mongodbUri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === 'test') {
    const mongoServer = await MongoMemoryServer.create();
    mongodbUri = mongoServer.getUri();
    console.log('Mongo server uri is ', mongodbUri);
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

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    // await global.__MONGOD__.stop();
  } catch (error) {
    // console.log(error);
    console.error('❌Failed to disconnect from MongoDB');
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};

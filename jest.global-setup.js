const { connectDB } = require('./src/config/db');

module.exports = async () => {
  await connectDB();
};

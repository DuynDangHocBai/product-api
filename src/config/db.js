const mongoose = require('mongoose');

async function connectDB(uri) {
  await mongoose.connect(uri);
  const { host, port, name } = mongoose.connection;
  console.log(`MongoDB connected: ${host}:${port}/${name}`);
}

module.exports = connectDB;
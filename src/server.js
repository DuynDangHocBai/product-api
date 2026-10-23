require('dotenv').config({ quiet: true });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;
const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

connectDB(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Product API running at http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
require('dotenv').config();

const app = require('./server/app');
const { initializeDatabase } = require('./server/config/init-db');

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`StudySpace server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start StudySpace server:', error.message);
    process.exit(1);
  }
};

startServer();

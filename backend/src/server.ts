import app from './app';
import { config } from './config/env';
import { connectDB } from './config/database';

async function start() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`🚀 BloodConnect API running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

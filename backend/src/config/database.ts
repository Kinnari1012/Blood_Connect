import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env';

// Node.js c-ares may pick up a non-functional DNS server (e.g. 127.0.0.1 from
// Docker/WSL/VPN adapters). Override with reliable public resolvers so that
// mongodb+srv:// SRV lookups succeed.
const servers = dns.getServers();
if (servers.length === 0 || servers.every(s => s.startsWith('127.'))) {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: 'bloodconnect',
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

export default mongoose;

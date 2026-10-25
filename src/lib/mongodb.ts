import { MongoClient } from 'mongodb';
import dns from 'dns';

// Ensure SRV DNS resolution succeeds across local resolvers
if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if not permitted
  }
}

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (client) return { client };

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  client = new MongoClient(uri);
  await client.connect();
  return { client };
}

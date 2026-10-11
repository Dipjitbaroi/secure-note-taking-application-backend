import mongoose from 'mongoose';
import { env } from './env';

let connection: Promise<typeof mongoose> | null = null;

// Safe to call on every request: the first call connects, later calls reuse
// the same promise. Needed on Vercel, where there is no long-running server
// to connect once at startup.
export function connectDB() {
  connection ??= mongoose
    .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
    .then((m) => {
      console.log(`MongoDB connected: ${m.connection.name}`);
      return m;
    })
    .catch((err) => {
      connection = null; // allow a retry on the next request
      throw err;
    });

  return connection;
}

export async function disconnectDB() {
  connection = null;
  await mongoose.disconnect();
}

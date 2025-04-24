import mongoose, { Mongoose } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('⚠️ MONGO_URI não está definido no .env');
}

// Define uma interface para o cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extende o tipo do globalThis
declare global {
  // Isso evita conflitos no hot reload do Next.js
  var mongooseCache: MongooseCache | undefined;
}

// Usa o cache global para conexões persistentes
let cached: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI!, {
      dbName: 'MotorDeBusca',
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

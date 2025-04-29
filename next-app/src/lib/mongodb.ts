import mongoose, { Mongoose } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

// Define uma interface para o cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extende o tipo do globalThis
declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Usa o cache global para conexões persistentes
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: 'MotorDeBusca',
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
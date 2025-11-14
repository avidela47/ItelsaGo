import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ MONGODB_URI no está definida en el .env");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongooseCache = cached;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    // 👇 acá forzamos a string para que TS no rompa
    cached!.promise = mongoose.connect(MONGODB_URI as string);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn!;
}





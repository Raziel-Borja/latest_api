import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('⏳ Conectando a MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, {})
      .then((mongoose) => {
        console.log('✅ Conectado a MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

if (process.env.NODE_ENV !== 'production') {
  global.mongoose = cached;
}

export default dbConnect;

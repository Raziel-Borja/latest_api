import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable');
}

// Usa una variable global para mantener la conexión en caliente
let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('⏳ Conectando a MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Evita la creación excesiva de conexiones
      serverSelectionTimeoutMS: 5000, // Si no responde en 5s, aborta
      socketTimeoutMS: 45000, // Tiempo máximo de espera por respuesta
      keepAlive: true, // Mantiene la conexión activa
      bufferCommands: false // Desactiva el "buffering" en Mongoose
    }).then((mongoose) => {
      console.log('✅ Conectado a MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Error al conectar a MongoDB:', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

global.mongoose = cached;
export default dbConnect;

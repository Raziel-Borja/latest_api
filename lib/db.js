import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable');
}

// Cache de la conexión en `global` para evitar múltiples conexiones en desarrollo
let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('⏳ Conectando a MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log('✅ Conectado a MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Error al conectar a MongoDB:', error);
      process.exit(1); // Detener la ejecución si la conexión falla
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Guardar cache en `global` solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  global.mongoose = cached;
}

export default dbConnect;

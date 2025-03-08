import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import { NextResponse } from 'next/server';
import argon2 from 'argon2'; // ✅ Usamos argon2

// Configurar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}

export async function POST(request) {
  console.log('📩 Recibiendo solicitud POST en /api/register');
  await dbConnect();
  console.log('✅ Conectado a MongoDB, procesando datos...');

  try {
    const { username, password } = await request.json();
    console.log('🛠 Procesando usuario:', username);

    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      console.log('❌ Usuario ya existe');
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🔑 Hasheando contraseña con Argon2...');
    const hashedPassword = await argon2.hash(password); // ✅ Hashear con Argon2

    console.log('📝 Guardando usuario en MongoDB...');
    const newUser = await User.create({ username, password: hashedPassword });

    console.log('✅ Usuario creado con ID:', newUser._id);
    return NextResponse.json(
      { success: true, data: { id: newUser._id, username: newUser.username } },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('❌ Error en el registro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

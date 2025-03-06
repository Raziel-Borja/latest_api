import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // ⚠️ AJUSTA ESTO EN PRODUCCIÓN
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}

export async function POST(request) {
  console.log('📩 Recibiendo solicitud POST en /api/login');
  await dbConnect();
  console.log('✅ Conectado a MongoDB, procesando datos...');

  try {
    const { username, password } = await request.json();
    console.log('🔍 Buscando usuario:', username);

    const user = await User.findOne({ username });

    if (!user) {
      console.log('❌ Usuario no encontrado:', username);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🔑 Usuario encontrado en DB:', user);

    if (!user.password) {
      console.log('⚠️ No hay contraseña en el registro del usuario');
      return NextResponse.json(
        { success: false, error: 'No password found for this user' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🔑 Verificando contraseña...');
    console.log('👉 Hash en DB:', user.password);
    console.log('👉 Contraseña ingresada:', password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('✅ Contraseña correcta, generando token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log('✅ Usuario autenticado:', user._id);
    return NextResponse.json(
      { success: true, token },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('❌ Error en el login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

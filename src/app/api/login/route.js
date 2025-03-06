import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// Configurar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permitir cualquier origen (AJUSTAR EN PRODUCCIÓN)
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Manejar solicitudes OPTIONS para CORS
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

    // Buscar el usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verificar la contraseña
    console.log('🔑 Verificando contraseña...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Credenciales inválidas');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generar un token JWT
    console.log('🔐 Generando token JWT...');
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
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

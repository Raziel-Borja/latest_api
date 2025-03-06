import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();

  // Configurar los encabezados CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Permite solicitudes desde cualquier origen
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Métodos permitidos
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Encabezados permitidos
  };

  // Manejar solicitudes OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers, status: 200 });
  }

  try {
    const { username, password } = await request.json();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { headers, status: 400 }
      );
    }

    // Crear un nuevo usuario
    const user = new User({ username, password });
    await user.save();

    return NextResponse.json(
      { success: true, data: { id: user._id, username: user.username } },
      { headers, status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { headers, status: 500 }
    );
  }
}
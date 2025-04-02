import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // ⚠️ Ajustar en producción
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Manejar preflight requests
export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}

// GET: Obtener el top 10 de usuarios con más kills
export async function GET() {
  await dbConnect();

  try {
    const users = await User.find().sort({ kills: -1 }).limit(10);
    return NextResponse.json(
      { success: true, data: users },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Crear un nuevo usuario con kills iniciales
export async function POST(req) {
  await dbConnect();
  try {
    const { username, kills } = await req.json();

    if (!username || kills === undefined) {
      return NextResponse.json(
        { success: false, error: 'Username y kills son requeridos' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newUser = new User({ username, kills });
    await newUser.save();

    return NextResponse.json(
      { success: true, message: 'Usuario creado', data: newUser },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT: Actualizar el score (kills) de un usuario existente
export async function PUT(req) {
  await dbConnect();
  try {
    const { username, kills } = await req.json();

    if (!username || kills === undefined) {
      return NextResponse.json(
        { success: false, error: 'Username y kills son requeridos' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { kills },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Score actualizado', data: updatedUser },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

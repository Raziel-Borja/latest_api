import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // ⚠️ Permite peticiones desde cualquier origen (AJUSTAR EN PRODUCCIÓN)
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Manejar preflight requests
export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}

export async function GET() {
  await dbConnect();

  try {
    // Obtener los 10 usuarios con más kills
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

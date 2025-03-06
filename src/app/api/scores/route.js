import dbConnect from '@/../lib/db'; // Asegúrate de que esta ruta sea correcta
import User from '@/../models/User'; // Asegúrate de que esta ruta sea correcta
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();

  try {
    // Obtener los 10 usuarios con más kills
    const users = await User.find().sort({ kills: -1 }).limit(10);
    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
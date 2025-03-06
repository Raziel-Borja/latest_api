import dbConnect from '@/../lib/db';
import User from '@/../models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log("📩 Recibiendo solicitud POST en /api/register");

  // Aplicar timeout manual
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("⏳ Tiempo de ejecución excedido")), 30000)
  );

  return Promise.race([handleRequest(request), timeout]);
}

async function handleRequest(request) {
  await dbConnect();
  console.log("🔗 Base de datos conectada");

  try {
    const { username, password } = await request.json();
    console.log("👤 Datos recibidos:", username);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("⚠️ Usuario ya existe");
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    const user = new User({ username, password });
    await user.save();
    console.log("✅ Usuario creado:", user._id);

    return NextResponse.json(
      { success: true, data: { id: user._id, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error en /api/register:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

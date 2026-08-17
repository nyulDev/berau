import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionEmail =
    session?.user && "email" in session.user
      ? (session.user as any).email
      : undefined;
  if (!sessionEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal mengambil data user" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // next-auth Credentials + jwt session kadang tidak mengirim session.user.email
  const email =
    session?.user && "email" in session.user
      ? (session.user as any).email
      : undefined;
  if (!email) {
    return NextResponse.json(
      { message: "Unauthorized", hint: "session.user.email kosong" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const name = body?.name ? String(body.name) : null;
    const password = String(body?.password ?? "");

    if (!email) {
      return NextResponse.json(
        { message: "Email harus diisi" },
        { status: 400 },
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
      },
    });

    return NextResponse.json(
      { message: "User berhasil dibuat" },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal membuat user" },
      { status: 500 },
    );
  }
}

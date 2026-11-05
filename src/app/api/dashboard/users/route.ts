import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findFirst({
      where: sessionUser.id
        ? { id: sessionUser.id }
        : sessionUser.email
          ? { email: sessionUser.email }
          : { id: "__invalid_session_user__" },
      select: { id: true, role: true },
    });
    if (!currentUser) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });
    }

    let isAdmin = currentUser.role === "admin";
    if (!isAdmin) {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount === 0) {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: { role: "admin" },
        });
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ message: "Hanya admin yang dapat mengakses daftar user" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
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
  const sessionUser = session?.user as any;
  if (!sessionUser) {
    return NextResponse.json(
      { message: "Unauthorized", hint: "session.user.email kosong" },
      { status: 401 },
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: sessionUser.id
      ? { id: sessionUser.id }
      : { email: sessionUser.email },
    select: { id: true, role: true },
  });
  let isAdmin = currentUser?.role === "admin";
  if (!isAdmin && currentUser) {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount === 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { role: "admin" },
      });
      isAdmin = true;
    }
  }
  if (!isAdmin) {
    return NextResponse.json(
      { message: "Hanya admin yang dapat membuat user" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const name = body?.name ? String(body.name) : null;
    const password = String(body?.password ?? "");
    const role = body?.role === "admin" ? "admin" : "user";

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
        role,
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

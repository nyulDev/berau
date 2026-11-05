import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser) return null;

  return prisma.user.findUnique({
    where: sessionUser.id
      ? { id: sessionUser.id }
      : { email: sessionUser.email },
    select: { id: true, role: true },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (currentUser.role !== "admin") {
    return NextResponse.json({ message: "Hanya admin yang dapat mengubah role" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const role = body?.role === "admin" ? "admin" : body?.role === "user" ? "user" : null;
  if (!role) {
    return NextResponse.json({ message: "Role tidak valid" }, { status: 400 });
  }

  if (currentUser.id === id && role !== "admin") {
    return NextResponse.json({ message: "Tidak dapat mengubah role admin yang sedang digunakan" }, { status: 400 });
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Gagal mengubah role user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: sessionUser.id
      ? { id: sessionUser.id }
      : { email: sessionUser.email },
    select: { id: true, role: true },
  });
  if (currentUser?.role !== "admin") {
    return NextResponse.json(
      { message: "Hanya admin yang dapat menghapus user" },
      { status: 403 },
    );
  }

  const { id } = await params;

  // Cegah user menghapus akunnya sendiri
  if (currentUser.id === id) {
    return NextResponse.json(
      { message: "Tidak dapat menghapus akun yang sedang digunakan" },
      { status: 400 },
    );
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 },
    );
  }
}

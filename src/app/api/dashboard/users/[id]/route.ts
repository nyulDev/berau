import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const sessionEmail =
    session?.user && "email" in session.user
      ? (session.user as any).email
      : undefined;
  if (!sessionEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Cegah user menghapus akunnya sendiri
  const sessionUser = await prisma.user.findUnique({
    where: { email: sessionEmail },
    select: { id: true },
  });
  if (sessionUser?.id === id) {
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

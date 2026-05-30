import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kode, nama, kota_asal, kontak, email, status } = body;

    // Check if kode is already used by another maskapai
    if (kode) {
      const existingMaskapai = await db.maskapai.findFirst({
        where: {
          kode: kode.toUpperCase(),
          NOT: { id },
        },
      });

      if (existingMaskapai) {
        return NextResponse.json(
          { error: "Kode maskapai sudah digunakan" },
          { status: 400 },
        );
      }
    }

    const maskapai = await db.maskapai.update({
      where: { id },
      data: {
        ...(kode && { kode: kode.toUpperCase() }),
        ...(nama && { nama }),
        ...(kontak !== undefined && { kontak }),
        ...(email !== undefined && { email }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      id: maskapai.id,
      kode: maskapai.kode,
      nama: maskapai.nama,
      kontak: maskapai.kontak,
      email: maskapai.email,
      status: maskapai.status,
    });
  } catch (error) {
    console.error("Error updating maskapai:", error);
    return NextResponse.json(
      { error: "Failed to update maskapai" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.maskapai.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maskapai:", error);
    return NextResponse.json(
      { error: "Failed to delete maskapai" },
      { status: 500 },
    );
  }
}

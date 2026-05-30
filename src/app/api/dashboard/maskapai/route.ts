import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const maskapaiList = await db.maskapai.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      maskapaiList.map((m) => ({
        id: m.id,
        kode: m.kode,
        nama: m.nama,
        kota_asal: m.kotaAsal,
        kontak: m.kontak,
        email: m.email,
        status: m.status,
      })),
    );
  } catch (error) {
    console.error("Error fetching maskapai:", error);
    return NextResponse.json(
      { error: "Failed to fetch maskapai data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kode, nama, kontak, email, status } = body;

    if (!kode || !nama) {
      return NextResponse.json(
        { error: "Kode dan nama harus diisi" },
        { status: 400 },
      );
    }

    // Check if kode already exists
    const existingMaskapai = await db.maskapai.findUnique({
      where: { kode: kode.toUpperCase() },
    });

    if (existingMaskapai) {
      return NextResponse.json(
        { error: "Kode maskapai sudah digunakan" },
        { status: 400 },
      );
    }

    const maskapai = await db.maskapai.create({
      data: {
        kode: kode.toUpperCase(),
        nama,
        kontak,
        email,
        status: status || "active",
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
    console.error("Error creating maskapai:", error);
    return NextResponse.json(
      { error: "Failed to create maskapai" },
      { status: 500 },
    );
  }
}

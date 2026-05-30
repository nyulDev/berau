import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const flight = await db.flight.update({
      where: { id },
      data: {
        tanggal: body.tanggal,
        operator: body.operator,
        transit: body.transit || null,
        kapasitasKursi: body.kapasitasKursi
          ? parseInt(body.kapasitasKursi)
          : null,
        datangAsal: body.datangAsal,
        datangTujuan: body.datangTujuan,
        datangFlightNumber: body.datangFlightNumber,
        datangDewasa: body.datangDewasa || null,
        datangAnak: body.datangAnak || null,
        datangBayi: body.datangBayi || null,
        datangBagasi: body.datangBagasi || null,
        datangCargo: body.datangCargo || null,
        datangPergerakan: body.datangPergerakan || null,
        berangkatAsal: body.berangkatAsal,
        berangkatTujuan: body.berangkatTujuan,
        berangkatFlightNumber: body.berangkatFlightNumber,
        berangkatDewasa: body.berangkatDewasa || null,
        berangkatAnak: body.berangkatAnak || null,
        berangkatBayi: body.berangkatBayi || null,
        berangkatBagasi: body.berangkatBagasi || null,
        berangkatCargo: body.berangkatCargo || null,
        berangkatPergerakan: body.berangkatPergerakan || null,
      },
    });

    return NextResponse.json(flight);
  } catch (error) {
    console.error("Error updating flight:", error);
    return NextResponse.json(
      { error: "Failed to update flight" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.flight.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.error("Error deleting flight:", error);
    return NextResponse.json(
      { error: "Failed to delete flight" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const [flights, total] = await Promise.all([
      db.flight.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.flight.count(),
    ]);

    return NextResponse.json({
      flights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const flight = await db.flight.create({
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

    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error("Error creating flight:", error);
    return NextResponse.json(
      { error: "Failed to create flight" },
      { status: 500 },
    );
  }
}

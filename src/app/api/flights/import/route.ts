import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface FlightImportRow {
  tanggal: string;
  operator: string;
  transit?: string | number | null;
  kapasitasKursi?: string | number | null;
  datangAsal: string;
  datangTujuan: string;
  datangFlightNumber: string;
  datangDewasa?: string | number | null;
  datangAnak?: string | number | null;
  datangBayi?: string | number | null;
  datangBagasi?: string | number | null;
  datangCargo?: string | number | null;
  datangPergerakan?: string | number | null;
  berangkatAsal: string;
  berangkatTujuan: string;
  berangkatFlightNumber: string;
  berangkatDewasa?: string | number | null;
  berangkatAnak?: string | number | null;
  berangkatBayi?: string | number | null;
  berangkatBagasi?: string | number | null;
  berangkatCargo?: string | number | null;
  berangkatPergerakan?: string | number | null;
}

function toStr(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  return String(val);
}

function toInt(val: unknown): number | null {
  if (val === undefined || val === null || val === "") return null;
  const n = parseInt(String(val));
  return isNaN(n) ? null : n;
}

// Convert Excel serial date number to ISO date string
function excelDateToISO(serial: number): string {
  // Excel date serial starts from Jan 1, 1900 (with the 1900 leap year bug)
  const utcDays = Math.floor(serial - 25569); // 25569 = days between Jan 1, 1900 and Jan 1, 1970
  const utcValue = utcDays * 86400 * 1000;
  const date = new Date(utcValue);
  return date.toISOString().split("T")[0];
}

function parseDateValue(val: unknown): string {
  if (val === undefined || val === null) return "";
  // If it's a number, it might be an Excel serial date
  if (typeof val === "number") {
    return excelDateToISO(val);
  }
  const str = String(val).trim();
  if (!str) return "";
  // Try to parse various date formats
  // Format: DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Format: YYYY-MM-DD (already ISO)
  const isoDate = str.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoDate) return str;
  // Try native Date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return str;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rows: FlightImportRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided" },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const tanggal = parseDateValue(row.tanggal);
        if (!tanggal) {
          results.failed++;
          results.errors.push({ row: i + 2, error: "Tanggal tidak valid" });
          continue;
        }
        if (!row.operator) {
          results.failed++;
          results.errors.push({ row: i + 2, error: "Operator tidak boleh kosong" });
          continue;
        }
        if (!row.datangAsal || !row.datangTujuan || !row.datangFlightNumber) {
          results.failed++;
          results.errors.push({ row: i + 2, error: "Data Datang (Asal/Tujuan/Flight Number) tidak lengkap" });
          continue;
        }
        if (!row.berangkatAsal || !row.berangkatTujuan || !row.berangkatFlightNumber) {
          results.failed++;
          results.errors.push({ row: i + 2, error: "Data Berangkat (Asal/Tujuan/Flight Number) tidak lengkap" });
          continue;
        }

        await db.flight.create({
          data: {
            tanggal,
            operator: String(row.operator),
            transit: toStr(row.transit),
            kapasitasKursi: toInt(row.kapasitasKursi),
            datangAsal: String(row.datangAsal),
            datangTujuan: String(row.datangTujuan),
            datangFlightNumber: String(row.datangFlightNumber),
            datangDewasa: toStr(row.datangDewasa),
            datangAnak: toStr(row.datangAnak),
            datangBayi: toStr(row.datangBayi),
            datangBagasi: toStr(row.datangBagasi),
            datangCargo: toStr(row.datangCargo),
            datangPergerakan: toStr(row.datangPergerakan),
            berangkatAsal: String(row.berangkatAsal),
            berangkatTujuan: String(row.berangkatTujuan),
            berangkatFlightNumber: String(row.berangkatFlightNumber),
            berangkatDewasa: toStr(row.berangkatDewasa),
            berangkatAnak: toStr(row.berangkatAnak),
            berangkatBayi: toStr(row.berangkatBayi),
            berangkatBagasi: toStr(row.berangkatBagasi),
            berangkatCargo: toStr(row.berangkatCargo),
            berangkatPergerakan: toStr(row.berangkatPergerakan),
          },
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error importing flights:", error);
    return NextResponse.json(
      { error: "Failed to import flights" },
      { status: 500 }
    );
  }
}

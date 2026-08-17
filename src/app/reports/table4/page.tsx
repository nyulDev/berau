"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Calendar } from "lucide-react";

interface Flight {
  id: string;
  tanggal: string;
  operator: string;
  transit: string | null;
  kapasitasKursi: number | null;
  datangAsal: string;
  datangTujuan: string;
  datangFlightNumber: string;
  datangDewasa: string | null;
  datangAnak: string | null;
  datangBayi: string | null;
  datangBagasi: string | null;
  datangCargo: string | null;
  datangPergerakan: string | null;
  berangkatAsal: string;
  berangkatTujuan: string;
  berangkatFlightNumber: string;
  berangkatDewasa: string | null;
  berangkatAnak: string | null;
  berangkatBayi: string | null;
  berangkatBagasi: string | null;
  berangkatCargo: string | null;
  berangkatPergerakan: string | null;
  createdAt: string;
  updatedAt: string;
}

const tableHTML = `<style>
  .air-traffic-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 11px;
    margin: 0 auto;
  }
  .air-traffic-table th, .air-traffic-table td {
    border: 1px solid #000;
    padding: 4px 2px;
    text-align: center;
    vertical-align: middle;
  }
  .air-traffic-table th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  .air-traffic-table th[rowspan="2"] {
    background-color: #e8f4f8;
  }
  .air-traffic-table th[colspan] {
    background-color: #fff2cc;
  }
</style>
<table class="air-traffic-table">
  <thead>
    <tr>
      <th rowspan="2" style="width: 5%;">NO</th>
      <th rowspan="2" style="width: 15%;">AIRLINE/OPERATOR</th>
      <th colspan="3" style="width: 15%;">PESAWAT</th>
      <th colspan="4" style="width: 15%;">PENUMPANG</th>
      <th colspan="4" style="width: 15%;">BAGASI (Kg)</th>
      <th colspan="4" style="width: 15%;">KARGO (Kg)</th>
    </tr>
    <tr>
      <th>DATANG</th>
      <th>BERANGKAT</th>
      <th>JUMLAH</th>
      <th>DATANG</th>
      <th>BERANGKAT</th>
      <th>TRANSIT</th>
      <th>JUMLAH</th>
      <th>DATANG</th>
      <th>BERANGKAT</th>
      <th>TRANSIT</th>
      <th>JUMLAH</th>
      <th>DATANG</th>
      <th>BERANGKAT</th>
      <th>TRANSIT</th>
      <th>JUMLAH</th>
    </tr>
  </thead>
  <tbody>`;

export default function Table4Page() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch("/api/flights?page=1&limit=10000");
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      setFlights(data.flights || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  // Get unique months from flights data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    flights.forEach((flight) => {
      if (flight.tanggal) {
        const date = new Date(flight.tanggal);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [flights]);

  // Filter flights by selected month
  const filteredFlights = useMemo(() => {
    if (!selectedMonth) {
      return flights;
    }
    return flights.filter((flight) => {
      if (!flight.tanggal) return false;
      const flightDate = new Date(flight.tanggal);
      const flightYear = flightDate.getFullYear().toString();
      const flightMonth = (flightDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const monthKey = `${flightYear}-${flightMonth}`;

      return monthKey === selectedMonth;
    });
  }, [flights, selectedMonth]);

  // Get month name from month key
  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const generateTableRows = () => {
    // Group flights by operator
    const groupedFlights = filteredFlights.reduce(
      (acc, flight) => {
        const operator = flight.operator;
        if (!acc[operator]) {
          acc[operator] = {
            datangPergerakan: 0,
            berangkatPergerakan: 0,
            datangPenumpang: 0,
            berangkatPenumpang: 0,
            transitPenumpang: 0,
            datangBagasi: 0,
            berangkatBagasi: 0,
            datangCargo: 0,
            berangkatCargo: 0,
          };
        }
        // Sum the values
        acc[operator].datangPergerakan += parseInt(
          flight.datangPergerakan || "0",
        );
        acc[operator].berangkatPergerakan += parseInt(
          flight.berangkatPergerakan || "0",
        );
        acc[operator].datangPenumpang +=
          parseInt(flight.datangDewasa || "0") +
          parseInt(flight.datangAnak || "0") +
          parseInt(flight.datangBayi || "0");
        acc[operator].berangkatPenumpang +=
          parseInt(flight.berangkatDewasa || "0") +
          parseInt(flight.berangkatAnak || "0") +
          parseInt(flight.berangkatBayi || "0");
        acc[operator].transitPenumpang += parseInt(flight.transit || "0");
        acc[operator].datangBagasi += parseInt(flight.datangBagasi || "0");
        acc[operator].berangkatBagasi += parseInt(
          flight.berangkatBagasi || "0",
        );
        acc[operator].datangCargo += parseInt(flight.datangCargo || "0");
        acc[operator].berangkatCargo += parseInt(flight.berangkatCargo || "0");
        return acc;
      },
      {} as Record<string, any>,
    );

    // Initialize totals
    let totalDatangPergerakan = 0;
    let totalBerangkatPergerakan = 0;
    let totalDatangPenumpang = 0;
    let totalBerangkatPenumpang = 0;
    let totalTransitPenumpang = 0;
    let totalDatangBagasi = 0;
    let totalBerangkatBagasi = 0;
    let totalDatangCargo = 0;
    let totalBerangkatCargo = 0;

    // Calculate totals from grouped data
    Object.values(groupedFlights).forEach((data: any) => {
      totalDatangPergerakan += data.datangPergerakan;
      totalBerangkatPergerakan += data.berangkatPergerakan;
      totalDatangPenumpang += data.datangPenumpang;
      totalBerangkatPenumpang += data.berangkatPenumpang;
      totalTransitPenumpang += data.transitPenumpang;
      totalDatangBagasi += data.datangBagasi;
      totalBerangkatBagasi += data.berangkatBagasi;
      totalDatangCargo += data.datangCargo;
      totalBerangkatCargo += data.berangkatCargo;
    });

    const rows = Object.entries(groupedFlights)
      .map(([operator, data], index) => {
        const pesawatJumlah = data.datangPergerakan + data.berangkatPergerakan;
        const penumpangJumlah =
          data.datangPenumpang +
          data.berangkatPenumpang +
          data.transitPenumpang;
        const bagasiJumlah = data.datangBagasi + data.berangkatBagasi;
        const kargoJumlah = data.datangCargo + data.berangkatCargo;
        return `
      <tr>
        <td>${index + 1}</td>
        <td>${operator}</td>
        <td>${data.datangPergerakan}</td>
        <td>${data.berangkatPergerakan}</td>
        <td>${pesawatJumlah}</td>
        <td>${data.datangPenumpang}</td>
        <td>${data.berangkatPenumpang}</td>
        <td>${data.transitPenumpang}</td>
        <td>${penumpangJumlah}</td>
        <td>${data.datangBagasi}</td>
        <td>${data.berangkatBagasi}</td>
         <td>0</td>
        <td>${bagasiJumlah}</td>
        <td>${data.datangCargo}</td>
        <td>${data.berangkatCargo}</td>
         <td>0</td>
        <td>${kargoJumlah}</td>
      </tr>
    `;
      })
      .join("");

    // Add total row
    const totalPesawatJumlah = totalDatangPergerakan + totalBerangkatPergerakan;
    const totalPenumpangJumlah =
      totalDatangPenumpang + totalBerangkatPenumpang + totalTransitPenumpang;
    const totalBagasiJumlah = totalDatangBagasi + totalBerangkatBagasi;
    const totalKargoJumlah = totalDatangCargo + totalBerangkatCargo;
    const totalRow = `
      <tr style="font-weight: bold; background-color: #f0f0f0;">
        <td>TOTAL</td>
        <td></td>
        <td>${totalDatangPergerakan}</td>
        <td>${totalBerangkatPergerakan}</td>
        <td>${totalPesawatJumlah}</td>
        <td>${totalDatangPenumpang}</td>
        <td>${totalBerangkatPenumpang}</td>
        <td>${totalTransitPenumpang}</td>
        <td>${totalPenumpangJumlah}</td>
        <td>${totalDatangBagasi}</td>
        <td>${totalBerangkatBagasi}</td>
        <td>0</td>
        <td>${totalBagasiJumlah}</td>
        <td>${totalDatangCargo}</td>
        <td>${totalBerangkatCargo}</td>
        <td>0</td>
        <td>${totalKargoJumlah}</td>
      </tr>
    `;

    return rows + totalRow;
  };

  const fullTableHTML = `${tableHTML}${generateTableRows()}</tbody></table>`;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Filter Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Filter Bulan:</span>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Bulan</option>
                    {availableMonths.map((monthKey) => (
                      <option key={monthKey} value={monthKey}>
                        {getMonthName(monthKey)}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600">
                    Menampilkan {filteredFlights.length} dari {flights.length}{" "}
                    penerbangan
                  </div>
                </div>
              </div>

              {/* Page Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <table className="w-full border-none">
                  <tbody>
                    <tr>
                      <td className="text-left font-semibold">
                        KEMENTERIAN PERHUBUNGAN
                      </td>

                      <td className="font-bold ">
                        {
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR <br />
                      </td>
                      <td className="text-right">Lembar : DAU-04</td>
                    </tr>
                    <tr>
                      <td className="text-left font-semibold">DOMESTIC</td>
                      <td className="font-bold ">
                        {
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        BANDARA : KALIMARAU{" "}
                        {selectedMonth
                          ? getMonthName(selectedMonth).toUpperCase()
                          : "SEMUA BULAN"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                </div>
              </div>

              {/* Table Section */}
              <div className="rounded-md border">
                <div
                  dangerouslySetInnerHTML={{
                    __html: fullTableHTML,
                  }}
                />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-muted/30 mt-auto">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© 2026 Your Company. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

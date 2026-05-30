"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
  .air-traffic-table th[rowspan="3"] {
    background-color: #e8f4f8;
  }
  .air-traffic-table th[colspan] {
    background-color: #fff2cc;
  }
  .air-traffic-table th:only-child {
    background-color: #d9d9d9;
  }
</style>
<table class="air-traffic-table">
  <thead>
    <tr>
      <th rowspan="2" style="width: 2%;">NO</th>
      <th rowspan="2" style="width: 8%;">OPERATOR</th>
      <th rowspan="4" style="width: 10%;">JENIS KOMODITI</th>
      <th rowspan="3" style="width: 10%;">PERUSAHAAN EXPEDESI</th>
      <th rowspan="3" style="width: 10%;">ASAL / TUJUAN</th>
      <th colspan="2" style="width: 10%;">DATANG</th>
      <th colspan="2" style="width: 10%;">BERANGKAT</th>
    </tr>
    <tr>
      <th>Kg</th>
      <th>US$</th>
      <th>Kg</th>
      <th>US$</th>
    
    </tr>
  </thead>
  <tbody>`;

export default function Table6Page() {
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
    // Group flights by operator and calculate cargo totals
    const groupedFlights = filteredFlights.reduce(
      (acc, flight) => {
        const operator = flight.operator;
        if (!acc[operator]) {
          acc[operator] = {
            datangCargo: 0,
            berangkatCargo: 0,
          };
        }
        acc[operator].datangCargo += parseInt(flight.datangCargo || "0");
        acc[operator].berangkatCargo += parseInt(flight.berangkatCargo || "0");
        return acc;
      },
      {} as Record<string, { datangCargo: number; berangkatCargo: number }>,
    );

    return Object.entries(groupedFlights)
      .map(([operator, data], index) => {
        return `
      <tr>
        <td>${index + 1}</td>
        <td>${operator}</td>
        <td>0</td>
        <td>SN Cargo, CDA</td>
        <td>0</td>
        <td>${data.datangCargo}</td>
        <td>0</td>
        <td>${data.berangkatCargo}</td>
        <td>0</td>
      </tr>
    `;
      })
      .join("");
  };

  const fullTableHTML = `${tableHTML}${generateTableRows()}</tbody></table>`;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <DashboardHeader />

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
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        LALU LINTAS ANGKUTAN KARGO <br />
                      </td>
                      <td className="text-right">Lembar : DAU-06</td>
                    </tr>
                    <tr>
                      <td className="text-left font-semibold"></td>
                      <td className="font-bold ">
                        {"\u00A0\u00A0\u00A0\u00A0\u00A0"}
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

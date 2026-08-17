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
      <th rowspan="2" style="width: 5%;">KETERANGAN</th>
      <th colspan="3" style="width: 15%;">KEBERANGKATAN</th>
      <th colspan="3" style="width: 15%;">KEDATANGAN</th>
    </tr>
    <tr>
      <th>TANGGAL</th>
      <th>JAM</th>
      <th>JUMLAH</th>
      <th>TANGGAL</th>
      <th>JAM</th>
      <th>JUMLAH</th>
      
      
  </thead>
  <tbody>`;

export default function Table5Page() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [customDate, setCustomDate] = useState("6 Januari 2026");
  const [customTime, setCustomTime] = useState("07.00 s/d 19:30");

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

  // Dynamically update customDate when filteredFlights or selectedMonth changes
  useEffect(() => {
    if (flights.length > 0) {
      const dates = new Set<string>();
      filteredFlights.forEach((flight) => {
        if (flight.tanggal) {
          const d = new Date(flight.tanggal);
          const formatted = d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          dates.add(formatted);
        }
      });

      if (dates.size === 1) {
        setCustomDate(Array.from(dates)[0]);
      } else if (selectedMonth) {
        setCustomDate(getMonthName(selectedMonth));
      } else {
        setCustomDate("6 Januari 2026");
      }
    }
  }, [filteredFlights, selectedMonth, flights]);

  const generateTableRows = () => {
    // Calculate total departure movements (TOTAL Pesawat Berangkat from Table 1)
    const totalDepartureMovements = filteredFlights.reduce(
      (sum, flight) => sum + (parseFloat(flight.berangkatPergerakan || "0") > 0 ? 1 : 0),
      0,
    );

    // Calculate total arrival movements (TOTAL Pesawat Kedatangan from Table 1)
    const totalArrivalMovements = filteredFlights.reduce(
      (sum, flight) => sum + (parseFloat(flight.datangPergerakan || "0") > 0 ? 1 : 0),
      0,
    );

    // Return a single row with keterangan, tanggal, jam as custom inputs, and jumlah fields
    return `<tr>
      <td></td>
      <td>${customDate}</td>
      <td>${customTime}</td>
      <td>${totalDepartureMovements}</td>
      <td>${customDate}</td>
      <td>${customTime}</td>
      <td>${totalArrivalMovements}</td>
    </tr>`;
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
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">Filter Bulan:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua Bulan</option>
                      {availableMonths.map((monthKey) => (
                        <option key={monthKey} value={monthKey}>
                          {getMonthName(monthKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Tanggal:</span>
                    <input
                      type="text"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                      placeholder="Contoh: 6 Januari 2026"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Jam:</span>
                    <input
                      type="text"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      placeholder="Contoh: 07.00 s/d 19:30"
                    />
                  </div>

                  <div className="text-sm text-gray-500 ml-auto">
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
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        DATA ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR <br />
                      </td>
                      <td className="text-right">Lembar : DAU-05</td>
                    </tr>
                    <tr>
                      <td className="text-left font-semibold"></td>
                      <td className="font-bold ">
                        {
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        BANDARA : KALIMARAU BULAN : {" "}
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

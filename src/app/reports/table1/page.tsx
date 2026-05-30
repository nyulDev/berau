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
  aircraftType?: string; // "SJ134 - SJ552"
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
      <th rowspan="3" style="width: 2%;">NO</th>
      <th rowspan="3" style="width: 8%;">RUTE</th>
      <th rowspan="3" style="width: 8%;">OPERATOR</th>
      <th style="width: 10%;">BERJADWAL/</th>
      <th rowspan="3" style="width: 12%;">TIPE PESAWAT</th>
      <th rowspan="3" style="width: 8%;">KAPASITAS KURSI</th>
      <th colspan="3" rowspan="2"> Pesawat</th>
      <th colspan="9"> PENUMPANG</th>
      <th rowspan="2" colspan="3" style="width: 6%;">BAGASI<br>(Kg)</th>
      <th rowspan="2" colspan="3" style="width: 6%;">KARGO<br>(Kg)</th>
    </tr>
    <tr>
     <th> TIDAK</th>
     <th colspan="3">Datang</th>
     <th colspan="3">Berangkat</th>
     <th colspan="3">Transit</th>

    </tr>
    <tr>
      <th>BERJADWAL</th>
      <th>DTG</th>
      <th>BRK</th>
      <th>LOKAL</th>
      <th>Dewasa</th>
      <th>Anak</th>
      <th> Bayi</th>
      <th>Dewasa</th>
      <th>Anak</th>
      <th> Bayi</th>
      <th>Dewasa</th>
      <th>Anak</th>
      <th> Bayi</th>
      <th>DTG</th>
      <th>BRK</th>
      <th>TRANSIT</th>
       <th>DTG</th>
      <th>BRK</th>
      <th>TRANSIT</th>
    </tr>
  </thead>
  <tbody>`;

export default function Table1Page() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapais, setMaskapais] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    fetchMaskapai();
  }, []);

  const fetchMaskapai = async () => {
    try {
      const response = await fetch("/api/dashboard/maskapai");
      if (!response.ok) throw new Error("Failed to fetch maskapais");
      const data = await response.json();
      setMaskapais(data);
    } catch (error) {
      console.error("Error fetching maskapais:", error);
    }
  };

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

  // Tambahkan fungsi untuk menghitung total pergerakan arrival
  const calculateTotalArrivalMovement = (flights: Flight[]) => {
    const movementMap = new Map();

    flights.forEach((flight) => {
      // Jika "tipe pesawat" tersimpan di datangFlightNumber
      const key = flight.datangFlightNumber; // "SJ134-SJ552"

      // Atau jika ada field terpisah
      // const key = flight.aircraftType || flight.datangFlightNumber;

      const currentMovement = parseFloat(flight.datangPergerakan || "0");

      if (movementMap.has(key)) {
        movementMap.set(key, movementMap.get(key) + currentMovement);
      } else {
        movementMap.set(key, currentMovement);
      }
    });

    return movementMap;
  };

  // Gunakan dalam komponen
  const totalArrivalMovements = calculateTotalArrivalMovement(filteredFlights);

  // Fungsi untuk mendapatkan total pergerakan untuk flight tertentu
  const getTotalArrivalMovement = (flight: Flight) => {
    const key = flight.datangFlightNumber;
    return totalArrivalMovements.get(key) || 0;
  };

  const maskapaiStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    maskapais.forEach((m: any) => {
      const display =
        m.status.toLowerCase() === "active" ? "Berjadwal" : "Tidak Berjadwal";
      if (m.kode) map.set(m.kode.toUpperCase(), display);
      if (m.nama) map.set(m.nama.toUpperCase(), display);
    });
    return map;
  }, [maskapais]);

  const generateTableRows = () => {
    // Group flights by route, operator, and aircraft type
    const groupedFlights = new Map();

    // Initialize totals
    let totalKapasitasKursi = 0;
    let totalDatangPesawat = 0;
    let totalBerangkatPesawat = 0;
    let totalLokalPesawat = 0;
    let totalDatangDewasa = 0;
    let totalDatangAnak = 0;
    let totalDatangBayi = 0;
    let totalBerangkatDewasa = 0;
    let totalBerangkatAnak = 0;
    let totalBerangkatBayi = 0;
    let totalTransitDewasa = 0;
    let totalTransitAnak = 0;
    let totalTransitBayi = 0;
    let totalDatangBagasi = 0;
    let totalBerangkatBagasi = 0;
    let totalTransitBagasi = 0;
    let totalDatangCargo = 0;
    let totalBerangkatCargo = 0;
    let totalTransitCargo = 0;

    filteredFlights.forEach((flight) => {
      const route = `${flight.datangAsal}-${flight.datangTujuan}`;
      const aircraftType = `${flight.datangFlightNumber} - ${flight.berangkatFlightNumber}`;
      const key = `${route}|${flight.operator}|${aircraftType}`;

      if (!groupedFlights.has(key)) {
        groupedFlights.set(key, {
          route,
          operator: flight.operator,
          aircraftType,
          kapasitasKursi: flight.kapasitasKursi,
          datangDewasa: 0,
          datangAnak: 0,
          datangBayi: 0,
          berangkatDewasa: 0,
          berangkatAnak: 0,
          berangkatBayi: 0,
          transitDewasa: 0,
          transitAnak: 0,
          transitBayi: 0,
          datangBagasi: 0,
          berangkatBagasi: 0,
          transitBagasi: 0,
          datangCargo: 0,
          berangkatCargo: 0,
          transitCargo: 0,
          datangPesawat: 0,
          berangkatPesawat: 0,
          lokalPesawat: 0,
          berjadwal:
            maskapaiStatusMap.get(flight.operator?.toUpperCase() || "") ||
            "Berjadwal", // Active -> Berjadwal, Inactive -> Tidak berjadwal
        });
      }

      const group = groupedFlights.get(key);

      // Aggregate passengers
      group.datangDewasa += parseFloat(flight.datangDewasa || "0");
      group.datangAnak += parseFloat(flight.datangAnak || "0");
      group.datangBayi += parseFloat(flight.datangBayi || "0");
      group.berangkatDewasa += parseFloat(flight.berangkatDewasa || "0");
      group.berangkatAnak += parseFloat(flight.berangkatAnak || "0");
      group.berangkatBayi += parseFloat(flight.berangkatBayi || "0");
      // Calculate transit adults from flight.transit field, leave children and infants as 0
      group.transitDewasa += parseFloat(flight.transit || "0");

      // Aggregate bagasi and cargo
      group.datangBagasi += parseFloat(flight.datangBagasi || "0");
      group.berangkatBagasi += parseFloat(flight.berangkatBagasi || "0");
      // Transit bagasi if available
      group.datangCargo += parseFloat(flight.datangCargo || "0");
      group.berangkatCargo += parseFloat(flight.berangkatCargo || "0");

      // Count pesawat (flights)
      if (parseFloat(flight.datangPergerakan || "0") > 0) {
        group.datangPesawat += 1; // Each flight counts as one arrival only if pergerakan > 0
      }
      if (parseFloat(flight.berangkatPergerakan || "0") > 0) {
        group.berangkatPesawat += 1; // Each flight counts as one departure only if pergerakan > 0
      }
      // Lokal might be internal flights, perhaps if asal and tujuan are same or something
    });

    // Calculate totals from grouped data
    Array.from(groupedFlights.values()).forEach((group) => {
      totalKapasitasKursi += group.kapasitasKursi || 0;
      totalDatangPesawat += group.datangPesawat;
      totalBerangkatPesawat += group.berangkatPesawat;
      totalLokalPesawat += group.lokalPesawat;
      totalDatangDewasa += group.datangDewasa;
      totalDatangAnak += group.datangAnak;
      totalDatangBayi += group.datangBayi;
      totalBerangkatDewasa += group.berangkatDewasa;
      totalBerangkatAnak += group.berangkatAnak;
      totalBerangkatBayi += group.berangkatBayi;
      totalTransitDewasa += group.transitDewasa;
      totalTransitAnak += group.transitAnak;
      totalTransitBayi += group.transitBayi;
      totalDatangBagasi += group.datangBagasi;
      totalBerangkatBagasi += group.berangkatBagasi;
      totalTransitBagasi += group.transitBagasi;
      totalDatangCargo += group.datangCargo;
      totalBerangkatCargo += group.berangkatCargo;
      totalTransitCargo += group.transitCargo;
    });

    // Generate rows from grouped data
    const rows = Array.from(groupedFlights.values())
      .map(
        (group, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${group.route}</td>
        <td>${group.operator}</td>
        <td>${group.berjadwal}</td>
        <td>${group.aircraftType}</td>
        <td>${group.kapasitasKursi}</td>
        <td>${group.datangPesawat}</td>
        <td>${group.berangkatPesawat}</td>
        <td>${group.lokalPesawat}</td>
        <td>${group.datangDewasa}</td>
        <td>${group.datangAnak}</td>
        <td>${group.datangBayi}</td>
        <td>${group.berangkatDewasa}</td>
        <td>${group.berangkatAnak}</td>
        <td>${group.berangkatBayi}</td>
        <td>${group.transitDewasa}</td>
        <td>${group.transitAnak}</td>
        <td>${group.transitBayi}</td>
        <td>${group.datangBagasi}</td>
        <td>${group.berangkatBagasi}</td>
        <td>${group.transitBagasi}</td>
        <td>${group.datangCargo}</td>
        <td>${group.berangkatCargo}</td>
        <td>${group.transitCargo}</td>
      </tr>
    `,
      )
      .join("");

    // Add total row
    const totalRow = `
      <tr style="font-weight: bold; background-color: #f0f0f0;">
        <td>TOTAL</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${totalKapasitasKursi}</td>
        <td>${totalDatangPesawat}</td>
        <td>${totalBerangkatPesawat}</td>
        <td>${totalLokalPesawat}</td>
        <td>${totalDatangDewasa}</td>
        <td>${totalDatangAnak}</td>
        <td>${totalDatangBayi}</td>
        <td>${totalBerangkatDewasa}</td>
        <td>${totalBerangkatAnak}</td>
        <td>${totalBerangkatBayi}</td>
        <td>${totalTransitDewasa}</td>
        <td>${totalTransitAnak}</td>
        <td>${totalTransitBayi}</td>
        <td>${totalDatangBagasi}</td>
        <td>${totalBerangkatBagasi}</td>
        <td>${totalTransitBagasi}</td>
        <td>${totalDatangCargo}</td>
        <td>${totalBerangkatCargo}</td>
        <td>${totalTransitCargo}</td>
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
                          "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                        }
                        ARUS LALU LINTAS ANGKUTAN UDARA <br />
                      </td>
                      <td className="text-right">Lembar : DAU-01</td>
                    </tr>
                    <tr>
                      <td className="text-left font-semibold">DOMESTIC</td>
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

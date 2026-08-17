"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  aircraftType?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportAllPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapais, setMaskapais] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Get current date for default values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  useEffect(() => {
    document.title = "All Reports | Kalimarau International";
    fetchFlights();
    fetchMaskapai();
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

  // Helper function to parse number safely
  const parseNum = (val: string | null | undefined): number => {
    if (!val) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
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

  // Generate Table 1 Data
  const generateTable1Data = () => {
    const groupedFlights = new Map<string, any>();

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
          datangBagasi: 0,
          berangkatBagasi: 0,
          datangCargo: 0,
          berangkatCargo: 0,
          datangPesawat: 0,
          berangkatPesawat: 0,
          lokalPesawat: 0,
          berjadwal:
            maskapaiStatusMap.get(flight.operator?.toUpperCase() || "") ||
            "Berjadwal",
        });
      }

      const group = groupedFlights.get(key);
      group.datangDewasa += parseNum(flight.datangDewasa);
      group.datangAnak += parseNum(flight.datangAnak);
      group.datangBayi += parseNum(flight.datangBayi);
      group.berangkatDewasa += parseNum(flight.berangkatDewasa);
      group.berangkatAnak += parseNum(flight.berangkatAnak);
      group.berangkatBayi += parseNum(flight.berangkatBayi);
      group.transitDewasa += parseNum(flight.transit);
      group.datangBagasi += parseNum(flight.datangBagasi);
      group.berangkatBagasi += parseNum(flight.berangkatBagasi);
      group.datangCargo += parseNum(flight.datangCargo);
      group.berangkatCargo += parseNum(flight.berangkatCargo);

      if (parseNum(flight.datangPergerakan) > 0) {
        group.datangPesawat += 1;
      }
      if (parseNum(flight.berangkatPergerakan) > 0) {
        group.berangkatPesawat += 1;
      }
    });

    return Array.from(groupedFlights.values());
  };

  // Generate Table 1 Totals
  const getTable1Totals = (data: any[]) => {
    return data.reduce(
      (acc, group) => ({
        kapasitasKursi: acc.kapasitasKursi + (group.kapasitasKursi || 0),
        datangPesawat: acc.datangPesawat + group.datangPesawat,
        berangkatPesawat: acc.berangkatPesawat + group.berangkatPesawat,
        lokalPesawat: acc.lokalPesawat + group.lokalPesawat,
        datangDewasa: acc.datangDewasa + group.datangDewasa,
        datangAnak: acc.datangAnak + group.datangAnak,
        datangBayi: acc.datangBayi + group.datangBayi,
        berangkatDewasa: acc.berangkatDewasa + group.berangkatDewasa,
        berangkatAnak: acc.berangkatAnak + group.berangkatAnak,
        berangkatBayi: acc.berangkatBayi + group.berangkatBayi,
        transitDewasa: acc.transitDewasa + group.transitDewasa,
        datangBagasi: acc.datangBagasi + group.datangBagasi,
        berangkatBagasi: acc.berangkatBagasi + group.berangkatBagasi,
        datangCargo: acc.datangCargo + group.datangCargo,
        berangkatCargo: acc.berangkatCargo + group.berangkatCargo,
      }),
      {
        kapasitasKursi: 0,
        datangPesawat: 0,
        berangkatPesawat: 0,
        lokalPesawat: 0,
        datangDewasa: 0,
        datangAnak: 0,
        datangBayi: 0,
        berangkatDewasa: 0,
        berangkatAnak: 0,
        berangkatBayi: 0,
        transitDewasa: 0,
        datangBagasi: 0,
        berangkatBagasi: 0,
        datangCargo: 0,
        berangkatCargo: 0,
      },
    );
  };

  // Generate Table 2 Data
  const generateTable2Data = () => {
    const totals = generateTable1Data().reduce(
      (acc, group) => ({
        datangPesawat: acc.datangPesawat + group.datangPesawat,
        berangkatPesawat: acc.berangkatPesawat + group.berangkatPesawat,
        lokalPesawat: acc.lokalPesawat + group.lokalPesawat,
        datangDewasa: acc.datangDewasa + group.datangDewasa,
        datangAnak: acc.datangAnak + group.datangAnak,
        datangBayi: acc.datangBayi + group.datangBayi,
        berangkatDewasa: acc.berangkatDewasa + group.berangkatDewasa,
        berangkatAnak: acc.berangkatAnak + group.berangkatAnak,
        berangkatBayi: acc.berangkatBayi + group.berangkatBayi,
        transitDewasa: acc.transitDewasa + group.transitDewasa,
        datangBagasi: acc.datangBagasi + group.datangBagasi,
        berangkatBagasi: acc.berangkatBagasi + group.berangkatBagasi,
        datangCargo: acc.datangCargo + group.datangCargo,
        berangkatCargo: acc.berangkatCargo + group.berangkatCargo,
      }),
      {
        datangPesawat: 0,
        berangkatPesawat: 0,
        lokalPesawat: 0,
        datangDewasa: 0,
        datangAnak: 0,
        datangBayi: 0,
        berangkatDewasa: 0,
        berangkatAnak: 0,
        berangkatBayi: 0,
        transitDewasa: 0,
        datangBagasi: 0,
        berangkatBagasi: 0,
        datangCargo: 0,
        berangkatCargo: 0,
      },
    );

    return [
      { jenis: "DOMESTIK", ...totals },
      {
        jenis: "INTERNASIONAL",
        datangPesawat: 0,
        berangkatPesawat: 0,
        lokalPesawat: 0,
        datangDewasa: 0,
        datangAnak: 0,
        datangBayi: 0,
        berangkatDewasa: 0,
        berangkatAnak: 0,
        berangkatBayi: 0,
        transitDewasa: 0,
        datangBagasi: 0,
        berangkatBagasi: 0,
        datangCargo: 0,
        berangkatCargo: 0,
      },
    ];
  };

  // Generate Table 3 Data
  const generateTable3Data = () => {
    const groupedFlights = filteredFlights.reduce(
      (acc, flight) => {
        const route = `${flight.datangAsal} - ${flight.datangTujuan}`;
        if (!acc[route]) {
          acc[route] = {
            route,
            datangPergerakan: 0,
            berangkatPergerakan: 0,
            datangPenumpang: 0,
            berangkatPenumpang: 0,
            datangBagasi: 0,
            berangkatBagasi: 0,
            datangCargo: 0,
            berangkatCargo: 0,
          };
        }
        acc[route].datangPergerakan += parseInt(flight.datangPergerakan || "0");
        acc[route].berangkatPergerakan += parseInt(
          flight.berangkatPergerakan || "0",
        );
        acc[route].datangPenumpang +=
          parseInt(flight.datangDewasa || "0") +
          parseInt(flight.datangAnak || "0") +
          parseInt(flight.datangBayi || "0");
        acc[route].berangkatPenumpang +=
          parseInt(flight.berangkatDewasa || "0") +
          parseInt(flight.berangkatAnak || "0") +
          parseInt(flight.berangkatBayi || "0");
        acc[route].datangBagasi += parseInt(flight.datangBagasi || "0");
        acc[route].berangkatBagasi += parseInt(flight.berangkatBagasi || "0");
        acc[route].datangCargo += parseInt(flight.datangCargo || "0");
        acc[route].berangkatCargo += parseInt(flight.berangkatCargo || "0");
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(groupedFlights);
  };

  const getTable3Totals = (data: any[]) => {
    return data.reduce(
      (acc, d) => ({
        datangPergerakan: acc.datangPergerakan + d.datangPergerakan,
        berangkatPergerakan: acc.berangkatPergerakan + d.berangkatPergerakan,
        datangPenumpang: acc.datangPenumpang + d.datangPenumpang,
        berangkatPenumpang: acc.berangkatPenumpang + d.berangkatPenumpang,
        datangBagasi: acc.datangBagasi + d.datangBagasi,
        berangkatBagasi: acc.berangkatBagasi + d.berangkatBagasi,
        datangCargo: acc.datangCargo + d.datangCargo,
        berangkatCargo: acc.berangkatCargo + d.berangkatCargo,
      }),
      {
        datangPergerakan: 0,
        berangkatPergerakan: 0,
        datangPenumpang: 0,
        berangkatPenumpang: 0,
        datangBagasi: 0,
        berangkatBagasi: 0,
        datangCargo: 0,
        berangkatCargo: 0,
      },
    );
  };

  // Generate Table 4 Data
  const generateTable4Data = () => {
    const groupedFlights = filteredFlights.reduce(
      (acc, flight) => {
        const operator = flight.operator;
        if (!acc[operator]) {
          acc[operator] = {
            operator,
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

    return Object.values(groupedFlights);
  };

  const getTable4Totals = (data: any[]) => {
    return data.reduce(
      (acc, d) => ({
        datangPergerakan: acc.datangPergerakan + d.datangPergerakan,
        berangkatPergerakan: acc.berangkatPergerakan + d.berangkatPergerakan,
        datangPenumpang: acc.datangPenumpang + d.datangPenumpang,
        berangkatPenumpang: acc.berangkatPenumpang + d.berangkatPenumpang,
        transitPenumpang: acc.transitPenumpang + d.transitPenumpang,
        datangBagasi: acc.datangBagasi + d.datangBagasi,
        berangkatBagasi: acc.berangkatBagasi + d.berangkatBagasi,
        datangCargo: acc.datangCargo + d.datangCargo,
        berangkatCargo: acc.berangkatCargo + d.berangkatCargo,
      }),
      {
        datangPergerakan: 0,
        berangkatPergerakan: 0,
        datangPenumpang: 0,
        berangkatPenumpang: 0,
        transitPenumpang: 0,
        datangBagasi: 0,
        berangkatBagasi: 0,
        datangCargo: 0,
        berangkatCargo: 0,
      },
    );
  };

  const table1Data = generateTable1Data();
  const table1Totals = getTable1Totals(table1Data);
  const table2Data = generateTable2Data();
  const table3Data = generateTable3Data();
  const table3Totals = getTable3Totals(table3Data);
  const table4Data = generateTable4Data();
  const table4Totals = getTable4Totals(table4Data);

  // Table 5: Pergerakan Pesawat (TOTAL pergerakan berangkat & kedatangan)
  const table5DepartureMovements = filteredFlights.reduce(
    (sum, flight) =>
      sum + (parseFloat(flight.berangkatPergerakan || "0") > 0 ? 1 : 0),
    0,
  );

  const table5ArrivalMovements = filteredFlights.reduce(
    (sum, flight) =>
      sum + (parseFloat(flight.datangPergerakan || "0") > 0 ? 1 : 0),
    0,
  );

  const table5DateDisplay = (() => {
    // pakai tanggal unik pertama dari filteredFlights, kalau >1 pakai nama bulan
    const dates = new Set<string>();
    filteredFlights.forEach((f) => {
      if (!f.tanggal) return;
      const d = new Date(f.tanggal);
      dates.add(
        d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    });
    if (dates.size === 1) return Array.from(dates)[0];
    if (selectedMonth) return getMonthName(selectedMonth);
    return "6 Januari 2026";
  })();

  const table5TimeDisplay = "07.00 s/d 19:30";

  // Table 6: Kargo per operator
  const table6Rows = useMemo(() => {
    const grouped: Record<
      string,
      { operator: string; datangCargo: number; berangkatCargo: number }
    > = {};

    filteredFlights.forEach((flight) => {
      const op = flight.operator || "-";
      if (!grouped[op]) {
        grouped[op] = { operator: op, datangCargo: 0, berangkatCargo: 0 };
      }
      grouped[op].datangCargo += parseInt(flight.datangCargo || "0", 10) || 0;
      grouped[op].berangkatCargo +=
        parseInt(flight.berangkatCargo || "0", 10) || 0;
    });

    return Object.values(grouped).map((g, idx) => ({
      operator: g.operator,
      jenisKomoditi: "0",
      perusahaanExpedesi: "SN Cargo, CDA",
      asalTujuan: "0",
      datangKg: g.datangCargo,
      berangkatKg: g.berangkatCargo,
    }));
  }, [filteredFlights]);

  // Export ke PDF menggunakan jspdf-autotable

  const exportToPDF = (): void => {
    setExporting(true);

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Header
      pdf.setFontSize(14);
      pdf.text("LAPORAN LALU LINTAS ANGKUTAN UDARA", 140, 12, {
        align: "center",
      });
      pdf.setFontSize(10);
      pdf.text("KEMENTERIAN PERHUBUNGAN", 10, 20);
      pdf.text(`Total Penerbangan: ${filteredFlights.length}`, 10, 26);

      let currentY = 35;

      // Table 1: Rute Penerbangan
      pdf.setFontSize(12);
      pdf.text("Tabel 1: Rute Penerbangan", 10, currentY);
      currentY += 5;

      autoTable(pdf, {
        startY: currentY,
        head: [
          [
            "NO",
            "RUTE",
            "OPERATOR",
            "BERJADWAL",
            "TIPE PESAWAT",
            "KAPASITAS",
            "DTG",
            "BRK",
            "LOKAL",
            "DTG",
            "BRK",
            "TRANSIT",
            "DTG",
            "BRK",
            "TRANSIT",
            "DTG",
            "BRK",
            "TRANSIT",
            "DTG",
            "BRK",
            "TRANSIT",
          ],
        ],
        body: table1Data.map((group, index) => [
          index + 1,
          group.route,
          group.operator,
          group.berjadwal,
          group.aircraftType || "-",
          group.kapasitasKursi || 0,
          group.datangPesawat,
          group.berangkatPesawat,
          group.lokalPesawat,
          group.datangDewasa,
          group.berangkatDewasa,
          group.transitDewasa,
          group.datangAnak,
          group.berangkatAnak,
          0,
          group.datangBayi,
          group.berangkatBayi,
          0,
          Math.round(group.datangBagasi),
          Math.round(group.berangkatBagasi),
          0,
          Math.round(group.datangCargo),
          Math.round(group.berangkatCargo),
          0,
        ]),
        foot: [
          [
            "TOTAL",
            "",
            "",
            "",
            "",
            table1Totals.kapasitasKursi,
            table1Totals.datangPesawat,
            table1Totals.berangkatPesawat,
            table1Totals.lokalPesawat,
            table1Totals.datangDewasa,
            table1Totals.berangkatDewasa,
            table1Totals.transitDewasa,
            table1Totals.datangAnak,
            table1Totals.berangkatAnak,
            0,
            table1Totals.datangBayi,
            table1Totals.berangkatBayi,
            0,
            Math.round(table1Totals.datangBagasi),
            Math.round(table1Totals.berangkatBagasi),
            0,
            Math.round(table1Totals.datangCargo),
            Math.round(table1Totals.berangkatCargo),
            0,
          ],
        ],
        styles: { fontSize: 6, cellPadding: 1, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        footStyles: { fillColor: [220, 220, 220], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 5 },
          1: { cellWidth: 15 },
          2: { cellWidth: 15 },
        },
        margin: { left: 5, right: 5 },
        tableWidth: "wrap",
      });

      // Table 2: Jenis Penerbangan
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Tabel 2: Jenis Penerbangan", 10, 15);

      autoTable(pdf, {
        startY: 20,
        head: [
          [
            "NO",
            "JENIS PENERBANGAN",
            "DATANG",
            "BERANGKAT",
            "LOKAL",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "TRANSIT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
          ],
        ],
        body: table2Data.map((row, index) => {
          const pesawatJumlah =
            row.datangPesawat + row.berangkatPesawat + row.lokalPesawat;
          const penumpangDatang =
            row.datangDewasa + row.datangAnak + row.datangBayi;
          const passengersBerangkat =
            row.berangkatDewasa + row.berangkatAnak + row.berangkatBayi;
          const penumpangJumlah = passengersBerangkat + passengersBerangkat;
          return [
            index + 1,
            row.jenis,
            row.datangPesawat,
            row.berangkatPesawat,
            row.lokalPesawat,
            pesawatJumlah,
            penumpangDatang,
            passengersBerangkat,
            0,
            penumpangJumlah,
            Math.round(row.datangBagasi),
            Math.round(row.berangkatBagasi),
            Math.round(row.datangBagasi + row.berangkatBagasi),
            Math.round(row.datangCargo),
            Math.round(row.berangkatCargo),
            Math.round(row.datangCargo + row.berangkatCargo),
          ];
        }),
        styles: { fontSize: 7, cellPadding: 1, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        margin: { left: 5, right: 5 },
        tableWidth: "wrap",
      });

      // Table 3: Bandara Asal/Tujuan
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Tabel 3: Bandara Asal/Tujuan", 10, 15);

      autoTable(pdf, {
        startY: 20,
        head: [
          [
            "NO",
            "BANDARA ASAL/TUJUAN",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
          ],
        ],
        body: table3Data.map((row, index) => [
          index + 1,
          row.route,
          row.datangPergerakan,
          row.berangkatPergerakan,
          row.datangPergerakan + row.berangkatPergerakan,
          row.datangPenumpang,
          row.berangkatPenumpang,
          row.datangPenumpang + row.berangkatPenumpang,
          Math.round(row.datangBagasi),
          Math.round(row.berangkatBagasi),
          Math.round(row.datangBagasi + row.berangkatBagasi),
          Math.round(row.datangCargo),
          Math.round(row.berangkatCargo),
          Math.round(row.datangCargo + row.berangkatCargo),
        ]),
        foot: [
          [
            "TOTAL",
            "",
            table3Totals.datangPergerakan,
            table3Totals.berangkatPergerakan,
            table3Totals.datangPergerakan + table3Totals.berangkatPergerakan,
            table3Totals.datangPenumpang,
            table3Totals.berangkatPenumpang,
            table3Totals.datangPenumpang + table3Totals.berangkatPenumpang,
            Math.round(table3Totals.datangBagasi),
            Math.round(table3Totals.berangkatBagasi),
            Math.round(
              table3Totals.datangBagasi + table3Totals.berangkatBagasi,
            ),
            Math.round(table3Totals.datangCargo),
            Math.round(table3Totals.berangkatCargo),
            Math.round(table3Totals.datangCargo + table3Totals.berangkatCargo),
          ],
        ],
        styles: { fontSize: 7, cellPadding: 1, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        footStyles: { fillColor: [220, 220, 220], fontStyle: "bold" },
        margin: { left: 5, right: 5 },
        tableWidth: "wrap",
      });

      // Table 4: Operator Airlines
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Tabel 4: Operator Airlines", 10, 15);

      autoTable(pdf, {
        startY: 20,
        head: [
          [
            "NO",
            "AIRLINE/OPERATOR",
            "DATANG",
            "BERANGKAT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "TRANSIT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "TRANSIT",
            "JUMLAH",
            "DATANG",
            "BERANGKAT",
            "TRANSIT",
            "JUMLAH",
          ],
        ],
        body: table4Data.map((row, index) => [
          index + 1,
          row.operator,
          row.datangPergerakan,
          row.berangkatPergerakan,
          row.datangPergerakan + row.berangkatPergerakan,
          row.datangPenumpang,
          row.berangkatPenumpang,
          row.transitPenumpang,
          row.datangPenumpang + row.berangkatPenumpang + row.transitPenumpang,
          Math.round(row.datangBagasi),
          Math.round(row.berangkatBagasi),
          0,
          Math.round(row.datangBagasi + row.berangkatBagasi),
          Math.round(row.datangCargo),
          Math.round(row.berangkatCargo),
          0,
          Math.round(row.datangCargo + row.berangkatCargo),
        ]),
        foot: [
          [
            "TOTAL",
            "",
            table4Totals.datangPergerakan,
            table4Totals.berangkatPergerakan,
            table4Totals.datangPergerakan + table4Totals.berangkatPergerakan,
            table4Totals.datangPenumpang,
            table4Totals.berangkatPenumpang,
            table4Totals.transitPenumpang,
            table4Totals.datangPenumpang +
              table4Totals.berangkatPenumpang +
              table4Totals.transitPenumpang,
            Math.round(table4Totals.datangBagasi),
            Math.round(table4Totals.berangkatBagasi),
            0,
            Math.round(
              table4Totals.datangBagasi + table4Totals.berangkatBagasi,
            ),
            Math.round(table4Totals.datangCargo),
            Math.round(table4Totals.berangkatCargo),
            0,
            Math.round(table4Totals.datangCargo + table4Totals.berangkatCargo),
          ],
        ],
        styles: { fontSize: 6, cellPadding: 1, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        footStyles: { fillColor: [220, 220, 220], fontStyle: "bold" },
        margin: { left: 5, right: 5 },
        tableWidth: "wrap",
      });

      // Table 5: Pergerakan Pesawat
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Tabel 5: Pergerakan Pesawat", 10, 15);

      autoTable(pdf, {
        startY: 20,
        head: [
          [
            "KETERANGAN",
            "DATANG (PESAWAT)",
            "BERANGKAT (PESAWAT)",
            "LOKAL (PESAWAT)",
            "TOTAL (PESAWAT)",
          ],
        ],
        body: [
          [
            "TOTAL",
            table1Totals.datangPesawat,
            table1Totals.berangkatPesawat,
            table1Totals.lokalPesawat,
            table1Totals.datangPesawat +
              table1Totals.berangkatPesawat +
              table1Totals.lokalPesawat,
          ],
        ],
        styles: { fontSize: 10, cellPadding: 2, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        margin: { left: 10, right: 10 },
        tableWidth: "auto",
      });

      // Table 6: Kargo
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Tabel 6: Kargo", 10, 15);

      autoTable(pdf, {
        startY: 20,
        head: [["KETERANGAN", "DATANG (KG)", "BERANGKAT (KG)", "TOTAL (KG)"]],
        body: [
          [
            "TOTAL",
            Math.round(table1Totals.datangBagasi + table1Totals.datangCargo),
            Math.round(
              table1Totals.berangkatBagasi + table1Totals.berangkatCargo,
            ),
            Math.round(
              table1Totals.datangBagasi +
                table1Totals.datangCargo +
                table1Totals.berangkatBagasi +
                table1Totals.berangkatCargo,
            ),
          ],
        ],
        styles: { fontSize: 10, cellPadding: 2, halign: "center" },
        headStyles: { fillColor: [255, 230, 153] },
        margin: { left: 10, right: 10 },
        tableWidth: "auto",
      });

      pdf.save("laporan-lalu-lintas-udara.pdf");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal mengexport PDF. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto px-0">
            <div className="max-w-none px-0">
              {/* Filter Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
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

              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                  Laporan Lalu Lintas Angkutan Udara
                  {selectedMonth && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      - {getMonthName(selectedMonth)}
                    </span>
                  )}
                </h1>
                <Button onClick={exportToPDF} disabled={exporting}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {exporting ? "Mengexport..." : "Export PDF"}
                </Button>
              </div>

              <div className="space-y-8">
                {/* Table 1 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Tabel 1: Rute Penerbangan
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={3}
                          className="text-center bg-yellow-100"
                        >
                          NO
                        </TableHead>
                        <TableHead
                          rowSpan={3}
                          className="text-center bg-yellow-100"
                        >
                          RUTE
                        </TableHead>
                        <TableHead
                          rowSpan={3}
                          className="text-center bg-yellow-100"
                        >
                          OPERATOR
                        </TableHead>
                        <TableHead
                          rowSpan={1}
                          className="text-center bg-yellow-200"
                        >
                          BERJADWAL/ TIDAK
                        </TableHead>
                        <TableHead
                          rowSpan={3}
                          className="text-center bg-yellow-100"
                        >
                          TIPE PESAWAT
                        </TableHead>
                        <TableHead
                          rowSpan={3}
                          className="text-center bg-yellow-100"
                        >
                          KAPASITAS KURSI
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          {" "}
                          PESAWAT
                        </TableHead>
                        <TableHead
                          colSpan={9}
                          className="text-center bg-yellow-200"
                        >
                          PENUMPANG
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          BAGASI (Kg)
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          KARGO (Kg)
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          BERJADWAL
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Datang
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Berangkat
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Transit
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Datang
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Berangkat
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-blue-100"
                        >
                          Transit
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-200">
                          DTG
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          DTG
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          BRK
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          LOKAL
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Dewasa
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Anak
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Bayi
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Dewasa
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Anak
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Bayi
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Dewasa
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Anak
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          Bayi
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          DTG
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          BRK
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          TRANSIT
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          DTG
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          BRK
                        </TableHead>
                        <TableHead className="text-center bg-gray-200">
                          TRANSIT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table1Data.map((group, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.route}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.operator}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berjadwal}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.aircraftType}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.kapasitasKursi}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.datangPesawat}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatPesawat}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.lokalPesawat}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.datangDewasa}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.datangAnak}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.datangBayi}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatDewasa}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatAnak}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatBayi}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.transitDewasa}
                          </TableCell>
                          <TableCell className="text-center">0</TableCell>
                          <TableCell className="text-center">0</TableCell>
                          <TableCell className="text-center">
                            {group.datangBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatBagasi}
                          </TableCell>
                          <TableCell className="text-center">0</TableCell>
                          <TableCell className="text-center">
                            {group.datangCargo}
                          </TableCell>
                          <TableCell className="text-center">
                            {group.berangkatCargo}
                          </TableCell>
                          <TableCell className="text-center">0</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-100">
                        <TableCell className="text-center">TOTAL</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-center">
                          {table1Totals.kapasitasKursi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangPesawat}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatPesawat}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.lokalPesawat}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangDewasa}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangAnak}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangBayi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatDewasa}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatAnak}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatBayi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.transitDewasa}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatBagasi}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">
                          {table1Totals.datangCargo}
                        </TableCell>
                        <TableCell className="text-center">
                          {table1Totals.berangkatCargo}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Table 2 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Tabel 2: Jenis Penerbangan
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          NO
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          JENIS PENERBANGAN
                        </TableHead>
                        <TableHead
                          colSpan={4}
                          className="text-center bg-yellow-200"
                        >
                          PESAWAT
                        </TableHead>
                        <TableHead
                          colSpan={4}
                          className="text-center bg-yellow-200"
                        >
                          PENUMPANG
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          BAGASI (Kg)
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          KARGO (Kg)
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          POS (Kg)
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          LOKAL
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          LOKAL
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table2Data.map((row, index) => {
                        const pesawatJumlah =
                          row.datangPesawat +
                          row.berangkatPesawat +
                          row.lokalPesawat;
                        const penumpangDatang =
                          row.datangDewasa + row.datangAnak + row.datangBayi;
                        const passengersBerangkat =
                          row.berangkatDewasa +
                          row.berangkatAnak +
                          row.berangkatBayi;
                        const penumpangJumlah =
                          passengersBerangkat + passengersBerangkat;
                        return (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.jenis}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangPesawat}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.berangkatPesawat}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.lokalPesawat}
                            </TableCell>
                            <TableCell className="text-center">
                              {pesawatJumlah}
                            </TableCell>
                            <TableCell className="text-center">
                              {penumpangDatang}
                            </TableCell>
                            <TableCell className="text-center">
                              {passengersBerangkat}
                            </TableCell>
                            <TableCell className="text-center">0</TableCell>
                            <TableCell className="text-center">
                              {penumpangJumlah}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangBagasi}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.berangkatBagasi}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangBagasi + row.berangkatBagasi}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangCargo}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.berangkatCargo}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangCargo + row.berangkatCargo}
                            </TableCell>
                            <TableCell className="text-center">0</TableCell>
                            <TableCell className="text-center">0</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Table 3 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Tabel 3: Bandara Asal/Tujuan
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          NO
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          BANDARA ASAL / TUJUAN{" "}
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          PESAWAT
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          PENUMPANG
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          BAGASI (Kg)
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          KARGO (Kg)
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table3Data.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.route}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPergerakan + row.berangkatPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPenumpang + row.berangkatPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangBagasi + row.berangkatBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangCargo}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatCargo}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangCargo + row.berangkatCargo}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-100">
                        <TableCell className="text-center">TOTAL</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.berangkatPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangPergerakan +
                            table3Totals.berangkatPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.berangkatPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangPenumpang +
                            table3Totals.berangkatPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.berangkatBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangBagasi +
                            table3Totals.berangkatBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangCargo}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.berangkatCargo}
                        </TableCell>
                        <TableCell className="text-center">
                          {table3Totals.datangCargo +
                            table3Totals.berangkatCargo}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Table 4 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Tabel 4: Operator Airlines
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          NO
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          AIRLINE/OPERATOR
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          PESAWAT
                        </TableHead>
                        <TableHead
                          colSpan={4}
                          className="text-center bg-yellow-200"
                        >
                          PENUMPANG
                        </TableHead>
                        <TableHead
                          colSpan={4}
                          className="text-center bg-yellow-200"
                        >
                          BAGASI (Kg)
                        </TableHead>
                        <TableHead
                          colSpan={4}
                          className="text-center bg-yellow-200"
                        >
                          KARGO (Kg)
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          TRANSIT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          TRANSIT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          DATANG
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          BERANGKAT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          TRANSIT
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table4Data.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.operator}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPergerakan + row.berangkatPergerakan}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.transitPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangPenumpang +
                              row.berangkatPenumpang +
                              row.transitPenumpang}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatBagasi}
                          </TableCell>
                          <TableCell className="text-center">0</TableCell>
                          <TableCell className="text-center">
                            {row.datangBagasi + row.berangkatBagasi}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.datangCargo}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.berangkatCargo}
                          </TableCell>
                          <TableCell className="text-center">0</TableCell>
                          <TableCell className="text-center">
                            {row.datangCargo + row.berangkatCargo}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-100">
                        <TableCell className="text-center">TOTAL</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.berangkatPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangPergerakan +
                            table4Totals.berangkatPergerakan}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.berangkatPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.transitPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangPenumpang +
                            table4Totals.berangkatPenumpang +
                            table4Totals.transitPenumpang}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.berangkatBagasi}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangBagasi +
                            table4Totals.berangkatBagasi}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangCargo}
                        </TableCell>
                        <TableCell className="text-center">
                          {table4Totals.berangkatCargo}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">
                          {table4Totals.datangCargo +
                            table4Totals.berangkatCargo}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Table 5 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Tabel 5: Pergerakan Pesawat
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          KETERANGAN
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          KEBERANGKATAN
                        </TableHead>
                        <TableHead
                          colSpan={3}
                          className="text-center bg-yellow-200"
                        >
                          KEDATANGAN
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          TANGGAL
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JAM
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          TANGGAL
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JAM
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          JUMLAH
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-center">-</TableCell>
                        <TableCell className="text-center">
                          {table5DateDisplay}
                        </TableCell>
                        <TableCell className="text-center">
                          {table5TimeDisplay}
                        </TableCell>
                        <TableCell className="text-center">
                          {table5DepartureMovements}
                        </TableCell>
                        <TableCell className="text-center">
                          {table5DateDisplay}
                        </TableCell>
                        <TableCell className="text-center">
                          {table5TimeDisplay}
                        </TableCell>
                        <TableCell className="text-center">
                          {table5ArrivalMovements}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Table 6 */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">Tabel 6: Kargo</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          NO
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-100"
                        >
                          OPERATOR
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          JENIS KOMODITI
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          PERUSAHAAN EXPEDESI
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          ASAL / TUJUAN
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          DATANG
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center bg-yellow-200"
                        >
                          BERANGKAT
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="text-center bg-gray-100">
                          Kg
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          US$
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          Kg
                        </TableHead>
                        <TableHead className="text-center bg-gray-100">
                          US$
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table6Rows.length > 0 ? (
                        table6Rows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.operator}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.jenisKomoditi}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.perusahaanExpedesi}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.asalTujuan}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.datangKg}
                            </TableCell>
                            <TableCell className="text-center">0</TableCell>
                            <TableCell className="text-center">
                              {row.berangkatKg}
                            </TableCell>
                            <TableCell className="text-center">0</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell className="text-center" colSpan={9}>
                            -
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

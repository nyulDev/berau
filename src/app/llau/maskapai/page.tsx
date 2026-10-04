"use client";

import { useEffect, useState, useMemo } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

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
}

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  status: string;
}

const BULAN_OPTIONS = [
  { value: "all",       label: "Semua Bulan" },
  { value: "1",  label: "Januari" },
  { value: "2",  label: "Februari" },
  { value: "3",  label: "Maret" },
  { value: "4",  label: "April" },
  { value: "5",  label: "Mei" },
  { value: "6",  label: "Juni" },
  { value: "7",  label: "Juli" },
  { value: "8",  label: "Agustus" },
  { value: "9",  label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const TAHUN_OPTIONS = ["2024", "2025", "2026", "2027"];

const n = (v: string | null | undefined) => parseFloat(v || "0") || 0;

export default function MaskapaiLLAUPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [filterBulan, setFilterBulan] = useState(String(now.getMonth() + 1));
  const [filterTahun, setFilterTahun] = useState(String(now.getFullYear()));
  const [filterOperator, setFilterOperator] = useState("all");

  // Reset operator filter saat bulan/tahun berubah
  const handleBulanChange = (val: string) => {
    setFilterBulan(val);
    setFilterOperator("all");
  };
  const handleTahunChange = (val: string) => {
    setFilterTahun(val);
    setFilterOperator("all");
  };

  useEffect(() => {
    document.title = "Maskapai LLAU | Kalimarau International";
    Promise.all([
      fetch("/api/flights?page=1&limit=100000").then((r) => r.json()),
      fetch("/api/dashboard/maskapai").then((r) => r.json()),
    ]).then(([flightData, maskapaiData]) => {
      setFlights(flightData.flights || []);
      setMaskapaiList(Array.isArray(maskapaiData) ? maskapaiData : []);
    }).finally(() => setLoading(false));
  }, []);

  // Daftar operator unik — hanya yang ada pada bulan & tahun yang dipilih
  const operatorOptions = useMemo(() => {
    const flightsBulanTahun = flights.filter((f) => {
      const d = new Date(f.tanggal);
      const matchBulan = filterBulan === "all" || d.getMonth() + 1 === parseInt(filterBulan);
      const matchTahun = d.getFullYear() === parseInt(filterTahun);
      return matchBulan && matchTahun;
    });
    return Array.from(new Set(flightsBulanTahun.map((f) => f.operator))).sort();
  }, [flights, filterBulan, filterTahun]);

  // Filter flights berdasarkan bulan, tahun, dan operator
  const filtered = useMemo(() => {
    return flights.filter((f) => {
      const d = new Date(f.tanggal);
      const matchBulan = filterBulan === "all" || d.getMonth() + 1 === parseInt(filterBulan);
      const matchTahun = d.getFullYear() === parseInt(filterTahun);
      const matchOp = filterOperator === "all" || f.operator === filterOperator;
      return matchBulan && matchTahun && matchOp;
    });
  }, [flights, filterBulan, filterTahun, filterOperator]);

  // Urutkan berdasarkan tanggal lalu operator
  const rows = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const td = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      if (td !== 0) return td;
      return a.operator.localeCompare(b.operator);
    });
  }, [filtered]);

  // Hitung totals
  const totals = useMemo(() => {
    let dtgPswt = 0, brkPswt = 0;
    let dtgDew = 0, dtgAnak = 0, dtgBayi = 0;
    let brkDew = 0, brkAnak = 0, brkBayi = 0;
    let dtgBag = 0, brkBag = 0;
    let dtgCargo = 0, brkCargo = 0;
    rows.forEach((f) => {
      if (n(f.datangPergerakan) > 0 || n(f.datangDewasa) > 0 || n(f.datangAnak) > 0 || n(f.datangBayi) > 0) dtgPswt++;
      if (n(f.berangkatPergerakan) > 0 || n(f.berangkatDewasa) > 0 || n(f.berangkatAnak) > 0 || n(f.berangkatBayi) > 0) brkPswt++;
      dtgDew   += n(f.datangDewasa);
      dtgAnak  += n(f.datangAnak);
      dtgBayi  += n(f.datangBayi);
      brkDew   += n(f.berangkatDewasa);
      brkAnak  += n(f.berangkatAnak);
      brkBayi  += n(f.berangkatBayi);
      dtgBag   += n(f.datangBagasi);
      brkBag   += n(f.berangkatBagasi);
      dtgCargo += n(f.datangCargo);
      brkCargo += n(f.berangkatCargo);
    });
    return {
      dtgPswt, brkPswt,
      dtgDew, dtgAnak, dtgBayi, dtgTotal: dtgDew + dtgAnak + dtgBayi,
      brkDew, brkAnak, brkBayi, brkTotal: brkDew + brkAnak + brkBayi,
      dtgBag, brkBag, dtgCargo, brkCargo,
    };
  }, [rows]);

  const bulanLabel = BULAN_OPTIONS.find((b) => b.value === filterBulan)?.label ?? "";

  // Export ke Excel (HTML table trick)
  const exportToExcel = () => {
    const table = document.getElementById("maskapai-llau-table");
    if (!table) return;
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>
        table { border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 3px 5px; font-size: 8pt; font-family: Arial; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
      </style></head>
      <body>${table.outerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Maskapai_LLAU_${bulanLabel}_${filterTahun}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMaskapaiNama = (operator: string) => {
    const m = maskapaiList.find(
      (mk) => mk.kode.toUpperCase() === operator.toUpperCase() || mk.nama.toUpperCase() === operator.toUpperCase()
    );
    return m ? m.nama : operator;
  };

  const formatTanggal = (t: string) => {
    const d = new Date(t);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="p-4 md:p-6 lg:p-8 space-y-4">

              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Maskapai LLAU</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Data pergerakan pesawat dan penumpang per maskapai
                </p>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-background p-4 shadow-sm">
                {/* Filter Bulan */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bulan</label>
                  <Select value={filterBulan} onValueChange={handleBulanChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BULAN_OPTIONS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Tahun */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tahun</label>
                  <Select value={filterTahun} onValueChange={handleTahunChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAHUN_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Operator */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operator / Maskapai</label>
                  <Select value={filterOperator} onValueChange={setFilterOperator}>
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Semua Maskapai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Maskapai</SelectItem>
                      {operatorOptions.map((op) => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Spacer + Export */}
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="flex items-center gap-2 rounded-md border bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total baris: <strong className="text-foreground">{rows.length}</strong></span>
                {filterOperator !== "all" && (
                  <span>Maskapai: <strong className="text-foreground">{filterOperator}</strong></span>
                )}
              </div>

              {/* Table */}
              <div className="rounded-xl border bg-background shadow-sm overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                    Memuat data...
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                    Tidak ada data untuk filter yang dipilih
                  </div>
                ) : (
                  <table
                    id="maskapai-llau-table"
                    className="w-full border-collapse text-xs"
                    style={{ minWidth: "1400px" }}
                  >
                    <thead>
                      {/* Row 1 — Group headers */}
                      <tr className="bg-sky-100 dark:bg-sky-900/40">
                        <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center font-bold">NO</th>
                        <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center font-bold">TANGGAL</th>
                        <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center font-bold whitespace-nowrap">OPERATOR<br/>YANG MELAYANI</th>
                        {/* DATA OPERATOR */}
                        <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center font-bold">DATA OPERATOR</th>
                        {/* PERGERAKAN PESAWAT */}
                        <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center font-bold">PERGERAKAN PESAWAT</th>
                        {/* PENUMPANG DIANGKUT */}
                        <th colSpan={8} className="border border-gray-300 px-2 py-1 text-center font-bold">PENUMPANG DIANGKUT</th>
                        {/* BAGASI */}
                        <th colSpan={2} className="border border-gray-300 px-2 py-1 text-center font-bold">BAGASI DIANGKUT (Kg)</th>
                        {/* CARGO */}
                        <th colSpan={2} className="border border-gray-300 px-2 py-1 text-center font-bold">CARGO DIANGKUT (Kg)</th>
                      </tr>
                      {/* Row 2 */}
                      <tr className="bg-sky-50 dark:bg-sky-900/20">
                        {/* DATA OPERATOR */}
                        <th colSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">DATANG</th>
                        <th colSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">BERANGKAT</th>
                        {/* PERGERAKAN PESAWAT */}
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold whitespace-nowrap">FLIGHT<br/>NUMBER<br/>DATANG</th>
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold whitespace-nowrap">FLIGHT<br/>NUMBER<br/>BERANGKAT</th>
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">DATANG</th>
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">BERANGKAT</th>
                        {/* PENUMPANG - DATANG */}
                        <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center font-semibold">DATANG</th>
                        {/* PENUMPANG - BERANGKAT */}
                        <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center font-semibold">BERANGKAT</th>
                        {/* BAGASI */}
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">DATANG</th>
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">BERANGKAT</th>
                        {/* CARGO */}
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">DATANG</th>
                        <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold">BERANGKAT</th>
                      </tr>
                      {/* Row 3 */}
                      <tr className="bg-sky-50 dark:bg-sky-900/20">
                        {/* DATA OPERATOR - DATANG */}
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">ASAL</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">TUJUAN</th>
                        {/* DATA OPERATOR - BERANGKAT */}
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">ASAL</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">TUJUAN</th>
                        {/* PENUMPANG DATANG */}
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">DEWASA</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">ANAK</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">BAYI</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">TOTAL</th>
                        {/* PENUMPANG BERANGKAT */}
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">DEWASA</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">ANAK</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">BAYI</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((f, idx) => {
                        const dtgTotal = n(f.datangDewasa) + n(f.datangAnak) + n(f.datangBayi);
                        const brkTotal = n(f.berangkatDewasa) + n(f.berangkatAnak) + n(f.berangkatBayi);
                        const dtgPswt = n(f.datangPergerakan) > 0 || dtgTotal > 0 ? 1 : 0;
                        const brkPswt = n(f.berangkatPergerakan) > 0 || brkTotal > 0 ? 1 : 0;
                        const isEven = idx % 2 === 1;
                        return (
                          <tr
                            key={f.id}
                            className={isEven ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-white dark:bg-background"}
                          >
                            <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{formatTanggal(f.tanggal)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{getMaskapaiNama(f.operator)}</td>
                            {/* DATA OPERATOR - DATANG */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{f.datangAsal}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{f.datangTujuan}</td>
                            {/* DATA OPERATOR - BERANGKAT */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{f.berangkatAsal}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{f.berangkatTujuan}</td>
                            {/* FLIGHT NUMBER */}
                            <td className="border border-gray-300 px-2 py-1 text-center font-mono">{f.datangFlightNumber}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center font-mono">{f.berangkatFlightNumber}</td>
                            {/* PERGERAKAN PESAWAT */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{dtgPswt || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{brkPswt || ""}</td>
                            {/* PENUMPANG DATANG */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.datangDewasa) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.datangAnak) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.datangBayi) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{dtgTotal || ""}</td>
                            {/* PENUMPANG BERANGKAT */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.berangkatDewasa) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.berangkatAnak) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.berangkatBayi) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{brkTotal || ""}</td>
                            {/* BAGASI */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.datangBagasi) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.berangkatBagasi) || ""}</td>
                            {/* CARGO */}
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.datangCargo) || ""}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{n(f.berangkatCargo) || ""}</td>
                          </tr>
                        );
                      })}

                      {/* JUMLAH Row */}
                      <tr className="bg-sky-100 dark:bg-sky-900/40 font-bold">
                        <td colSpan={9} className="border border-gray-300 px-2 py-1 text-center font-bold">JUMLAH</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgPswt}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkPswt}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgDew}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgAnak}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgBayi}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgTotal}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkDew}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkAnak}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkBayi}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkTotal}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgBag}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkBag}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.dtgCargo}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{totals.brkCargo}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

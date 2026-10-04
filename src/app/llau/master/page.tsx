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

const BULAN_OPTIONS = [
  { value: "all", label: "Semua Bulan" },
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

const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const n = (v: string | null | undefined) => parseFloat(v || "0") || 0;

type DayGroup = {
  tanggal: string;       // "2026-09-01"
  hariLabel: string;     // "SELASA"
  tanggalLabel: string;  // "01-Sep"
  rows: Flight[];
};

type Totals = {
  dtgPswt: number; brkPswt: number;
  dtgDew: number; dtgAnak: number; dtgBayi: number; dtgTotal: number;
  brkDew: number; brkAnak: number; brkBayi: number; brkTotal: number;
  dtgBag: number; brkBag: number;
  dtgCargo: number; brkCargo: number;
};

function calcTotals(rows: Flight[]): Totals {
  let dtgPswt = 0, brkPswt = 0;
  let dtgDew = 0, dtgAnak = 0, dtgBayi = 0;
  let brkDew = 0, brkAnak = 0, brkBayi = 0;
  let dtgBag = 0, brkBag = 0, dtgCargo = 0, brkCargo = 0;
  rows.forEach((f) => {
    const dd = n(f.datangDewasa) + n(f.datangAnak) + n(f.datangBayi);
    const bd = n(f.berangkatDewasa) + n(f.berangkatAnak) + n(f.berangkatBayi);
    if (n(f.datangPergerakan) > 0 || dd > 0) dtgPswt++;
    if (n(f.berangkatPergerakan) > 0 || bd > 0) brkPswt++;
    dtgDew += n(f.datangDewasa); dtgAnak += n(f.datangAnak); dtgBayi += n(f.datangBayi);
    brkDew += n(f.berangkatDewasa); brkAnak += n(f.berangkatAnak); brkBayi += n(f.berangkatBayi);
    dtgBag += n(f.datangBagasi); brkBag += n(f.berangkatBagasi);
    dtgCargo += n(f.datangCargo); brkCargo += n(f.berangkatCargo);
  });
  return {
    dtgPswt, brkPswt,
    dtgDew, dtgAnak, dtgBayi, dtgTotal: dtgDew + dtgAnak + dtgBayi,
    brkDew, brkAnak, brkBayi, brkTotal: brkDew + brkAnak + brkBayi,
    dtgBag, brkBag, dtgCargo, brkCargo,
  };
}

export default function MasterLLAUPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [filterBulan, setFilterBulan] = useState(String(now.getMonth() + 1));
  const [filterTahun, setFilterTahun] = useState(String(now.getFullYear()));

  useEffect(() => {
    document.title = "Master LLAU | Kalimarau International";
    fetch("/api/flights?page=1&limit=100000")
      .then((r) => r.json())
      .then((d) => setFlights(d.flights || []))
      .finally(() => setLoading(false));
  }, []);

  // Filter flights
  const filtered = useMemo(() => {
    return flights.filter((f) => {
      const d = new Date(f.tanggal);
      const matchBulan = filterBulan === "all" || d.getMonth() + 1 === parseInt(filterBulan);
      const matchTahun = d.getFullYear() === parseInt(filterTahun);
      return matchBulan && matchTahun;
    });
  }, [flights, filterBulan, filterTahun]);

  // Kelompokkan per tanggal, urutkan per tanggal lalu operator
  const dayGroups = useMemo((): DayGroup[] => {
    const map = new Map<string, Flight[]>();
    filtered.forEach((f) => {
      const key = f.tanggal.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    // Urutkan tanggal
    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([tanggal, rows]) => {
      const d = new Date(tanggal);
      const hariLabel = HARI_ID[d.getDay()].toUpperCase();
      const tanggalLabel = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      // Urutkan rows per operator
      const sortedRows = [...rows].sort((a, b) => a.operator.localeCompare(b.operator));
      return { tanggal, hariLabel, tanggalLabel, rows: sortedRows };
    });
  }, [filtered]);

  // Grand total seluruh data
  const grandTotal = useMemo(() => calcTotals(filtered), [filtered]);

  const bulanLabel = BULAN_OPTIONS.find((b) => b.value === filterBulan)?.label ?? "";

  // Export Excel
  const exportToExcel = () => {
    const table = document.getElementById("master-llau-table");
    if (!table) return;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>
        table{border-collapse:collapse;}
        td,th{border:1px solid black;padding:3px 5px;font-size:8pt;font-family:Arial;}
        .center{text-align:center;} .bold{font-weight:bold;}
      </style></head>
      <body>${table.outerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_LLAU_${bulanLabel}_${filterTahun}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render header tabel (dipakai di setiap grup hari) ──
  const TableHeader = () => (
    <thead>
      <tr className="bg-sky-100 dark:bg-sky-900/40">
        <th rowSpan={3} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">NO</th>
        <th rowSpan={3} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">TANGGAL</th>
        <th rowSpan={3} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px] whitespace-nowrap">OPERATOR<br/>YANG MELAYANI</th>
        <th colSpan={4} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">DATA OPERATOR</th>
        <th colSpan={4} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">PERGERAKAN PESAWAT</th>
        <th colSpan={8} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">PENUMPANG DIANGKUT</th>
        <th colSpan={2} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">BAGASI DIANGKUT (Kg)</th>
        <th colSpan={2} className="border border-gray-400 px-1 py-1 text-center font-bold text-[10px]">CARGO DIANGKUT (Kg)</th>
      </tr>
      <tr className="bg-sky-50 dark:bg-sky-900/20">
        <th colSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DATANG</th>
        <th colSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BERANGKAT</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">FLIGHT<br/>NUMBER<br/>DATANG</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">FLIGHT<br/>NUMBER<br/>BERANGKAT</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DATANG</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BERANGKAT</th>
        <th colSpan={4} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DATANG</th>
        <th colSpan={4} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BERANGKAT</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DATANG</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BERANGKAT</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DATANG</th>
        <th rowSpan={2} className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BERANGKAT</th>
      </tr>
      <tr className="bg-sky-50 dark:bg-sky-900/20">
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">ASAL</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">TUJUAN</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">ASAL</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">TUJUAN</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DEWASA</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">ANAK</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BAYI</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">TOTAL</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">DEWASA</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">ANAK</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">BAYI</th>
        <th className="border border-gray-400 px-1 py-1 text-center font-semibold text-[10px]">TOTAL</th>
      </tr>
    </thead>
  );

  // ── Render baris data ──
  const DataRow = ({ f, idx }: { f: Flight; idx: number }) => {
    const dtgTotal = n(f.datangDewasa) + n(f.datangAnak) + n(f.datangBayi);
    const brkTotal = n(f.berangkatDewasa) + n(f.berangkatAnak) + n(f.berangkatBayi);
    const dtgPswt  = n(f.datangPergerakan) > 0 || dtgTotal > 0 ? 1 : 0;
    const brkPswt  = n(f.berangkatPergerakan) > 0 || brkTotal > 0 ? 1 : 0;
    const isEven   = idx % 2 === 1;
    return (
      <tr className={isEven ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-white dark:bg-background"}>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{idx + 1}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] whitespace-nowrap">
          {new Date(f.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
        </td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-semibold">{f.operator}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{f.datangAsal}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{f.datangTujuan}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{f.berangkatAsal}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{f.berangkatTujuan}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-mono">{f.datangFlightNumber}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-mono">{f.berangkatFlightNumber}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{dtgPswt || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{brkPswt || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.datangDewasa) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.datangAnak) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.datangBayi) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-semibold">{dtgTotal || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.berangkatDewasa) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.berangkatAnak) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.berangkatBayi) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-semibold">{brkTotal || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.datangBagasi) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.berangkatBagasi) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.datangCargo) || ""}</td>
        <td className="border border-gray-300 px-1 py-0.5 text-center text-[10px]">{n(f.berangkatCargo) || ""}</td>
      </tr>
    );
  };

  // ── Render baris JUMLAH ──
  const JumlahRow = ({ t }: { t: Totals }) => (
    <tr className="bg-sky-100 dark:bg-sky-900/40 font-bold">
      <td colSpan={9} className="border border-gray-400 px-2 py-1 text-center text-[10px] font-bold">JUMLAH</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgPswt || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkPswt || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgDew || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgAnak || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgBayi || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgTotal || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkDew || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkAnak || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkBayi || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkTotal || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgBag || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkBag || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.dtgCargo || ""}</td>
      <td className="border border-gray-400 px-1 py-1 text-center text-[10px]">{t.brkCargo || ""}</td>
    </tr>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="p-4 md:p-6 lg:p-8 space-y-4">

              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Master LLAU</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Data pergerakan harian semua maskapai, dikelompokkan per hari
                </p>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bulan</label>
                  <Select value={filterBulan} onValueChange={setFilterBulan}>
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tahun</label>
                  <Select value={filterTahun} onValueChange={setFilterTahun}>
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

              {/* Info */}
              <div className="text-sm text-muted-foreground">
                Total: <strong className="text-foreground">{filtered.length} baris</strong> dalam{" "}
                <strong className="text-foreground">{dayGroups.length} hari</strong>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm rounded-xl border bg-background">
                  Memuat data...
                </div>
              ) : dayGroups.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm rounded-xl border bg-background">
                  Tidak ada data untuk periode yang dipilih
                </div>
              ) : (
                <div id="master-llau-table" className="space-y-6">
                  {dayGroups.map((group) => {
                    const t = calcTotals(group.rows);
                    return (
                      <div key={group.tanggal} className="rounded-xl border bg-background shadow-sm overflow-x-auto">
                        {/* Label hari */}
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                            {group.hariLabel}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full border-collapse"
                            style={{ minWidth: "1400px" }}
                          >
                            <TableHeader />
                            <tbody>
                              {group.rows.map((f, idx) => (
                                <DataRow key={f.id} f={f} idx={idx} />
                              ))}
                              <JumlahRow t={t} />
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {/* Grand Total */}
                  {dayGroups.length > 1 && (
                    <div className="rounded-xl border bg-background shadow-sm overflow-x-auto">
                      <div className="px-4 py-2 bg-blue-600 border-b">
                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                          TOTAL KESELURUHAN — {bulanLabel} {filterTahun}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ minWidth: "1400px" }}>
                          <TableHeader />
                          <tbody>
                            <JumlahRow t={grandTotal} />
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

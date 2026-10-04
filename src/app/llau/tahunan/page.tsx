"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
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
  datangDewasa: string | null;
  datangAnak: string | null;
  datangBayi: string | null;
  datangBagasi: string | null;
  datangCargo: string | null;
  datangPergerakan: string | null;
  berangkatDewasa: string | null;
  berangkatAnak: string | null;
  berangkatBayi: string | null;
  berangkatBagasi: string | null;
  berangkatCargo: string | null;
  berangkatPergerakan: string | null;
}

const BULAN_LABELS = [
  "JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI",
  "JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER",
];

const TAHUN_OPTIONS = ["2024","2025","2026","2027","2028"];

const n = (v: string | null | undefined) => parseFloat(v || "0") || 0;

type OperatorRow = {
  operator: string;
  dtgPswt: number; brkPswt: number;
  dtgPnp: number; brkPnp: number; transit: number;
  dtgBag: number; brkBag: number;
  dtgCargo: number; brkCargo: number;
};

type MonthData = {
  bulanIdx: number; // 0-11
  operators: OperatorRow[];
  total: OperatorRow;
};

export default function LLAUTahunanPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    document.title = "LLAU Tahunan | Kalimarau International";
    fetch("/api/flights?page=1&limit=100000")
      .then((r) => r.json())
      .then((d) => setFlights(d.flights || []))
      .finally(() => setLoading(false));
  }, []);

  // Filter per tahun
  const filtered = useMemo(() =>
    flights.filter((f) => new Date(f.tanggal).getFullYear() === parseInt(filterTahun)),
    [flights, filterTahun]
  );

  // Daftar operator unik tahun ini, urut abjad
  const allOperators = useMemo(() => {
    const ops = Array.from(new Set(filtered.map((f) => f.operator))).sort();
    return ops;
  }, [filtered]);

  // Hitung data per bulan per operator
  const monthDataList = useMemo((): MonthData[] => {
    return BULAN_LABELS.map((_, bulanIdx) => {
      const bulanFlights = filtered.filter(
        (f) => new Date(f.tanggal).getMonth() === bulanIdx
      );

      // Operator yang aktif bulan ini
      const opsThisMonth = Array.from(new Set(bulanFlights.map((f) => f.operator))).sort();

      const operators: OperatorRow[] = opsThisMonth.map((op) => {
        const opFlights = bulanFlights.filter((f) => f.operator === op);
        let dtgPswt = 0, brkPswt = 0;
        let dtgPnp = 0, brkPnp = 0, transit = 0;
        let dtgBag = 0, brkBag = 0, dtgCargo = 0, brkCargo = 0;
        opFlights.forEach((f) => {
          const dp = n(f.datangDewasa) + n(f.datangAnak) + n(f.datangBayi);
          const bp = n(f.berangkatDewasa) + n(f.berangkatAnak) + n(f.berangkatBayi);
          if (n(f.datangPergerakan) > 0 || dp > 0) dtgPswt++;
          if (n(f.berangkatPergerakan) > 0 || bp > 0) brkPswt++;
          dtgPnp   += dp;
          brkPnp   += bp;
          transit  += n(f.transit);
          dtgBag   += n(f.datangBagasi);
          brkBag   += n(f.berangkatBagasi);
          dtgCargo += n(f.datangCargo);
          brkCargo += n(f.berangkatCargo);
        });
        return { operator: op, dtgPswt, brkPswt, dtgPnp, brkPnp, transit, dtgBag, brkBag, dtgCargo, brkCargo };
      });

      // Total bulan
      const total: OperatorRow = operators.reduce(
        (acc, r) => ({
          operator: "TOTAL",
          dtgPswt:  acc.dtgPswt  + r.dtgPswt,
          brkPswt:  acc.brkPswt  + r.brkPswt,
          dtgPnp:   acc.dtgPnp   + r.dtgPnp,
          brkPnp:   acc.brkPnp   + r.brkPnp,
          transit:  acc.transit  + r.transit,
          dtgBag:   acc.dtgBag   + r.dtgBag,
          brkBag:   acc.brkBag   + r.brkBag,
          dtgCargo: acc.dtgCargo + r.dtgCargo,
          brkCargo: acc.brkCargo + r.brkCargo,
        }),
        { operator:"TOTAL", dtgPswt:0,brkPswt:0,dtgPnp:0,brkPnp:0,transit:0,dtgBag:0,brkBag:0,dtgCargo:0,brkCargo:0 }
      );

      return { bulanIdx, operators, total };
    });
  }, [filtered]);

  // Grand total / tahun
  const grandTotal = useMemo((): OperatorRow => {
    return monthDataList.reduce(
      (acc, m) => ({
        operator: "TOTAL/TAHUN",
        dtgPswt:  acc.dtgPswt  + m.total.dtgPswt,
        brkPswt:  acc.brkPswt  + m.total.brkPswt,
        dtgPnp:   acc.dtgPnp   + m.total.dtgPnp,
        brkPnp:   acc.brkPnp   + m.total.brkPnp,
        transit:  acc.transit  + m.total.transit,
        dtgBag:   acc.dtgBag   + m.total.dtgBag,
        brkBag:   acc.brkBag   + m.total.brkBag,
        dtgCargo: acc.dtgCargo + m.total.dtgCargo,
        brkCargo: acc.brkCargo + m.total.brkCargo,
      }),
      { operator:"TOTAL/TAHUN",dtgPswt:0,brkPswt:0,dtgPnp:0,brkPnp:0,transit:0,dtgBag:0,brkBag:0,dtgCargo:0,brkCargo:0 }
    );
  }, [monthDataList]);

  // Export Excel
  const exportToExcel = () => {
    const table = document.getElementById("llau-tahunan-table");
    if (!table) return;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>
        table{border-collapse:collapse;}
        td,th{border:1px solid black;padding:3px 6px;font-size:9pt;font-family:Arial;}
      </style></head>
      <body>${table.outerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LLAU_Tahunan_${filterTahun}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (v: number) => v > 0 ? v.toLocaleString("id-ID") : "0";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="p-4 md:p-6 lg:p-8 space-y-4">

              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">LLAU Tahunan</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Data Lalu Lintas Angkutan Udara — UPBU Kelas I Kalimarau
                </p>
              </div>

              {/* Filter + Export */}
              <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tahun</label>
                  <Select value={filterTahun} onValueChange={setFilterTahun}>
                    <SelectTrigger className="w-32">
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
                    className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Tabel */}
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm rounded-xl border bg-background">
                  Memuat data...
                </div>
              ) : (
                <div className="rounded-xl border bg-background shadow-sm overflow-x-auto">
                  <table
                    id="llau-tahunan-table"
                    className="w-full border-collapse text-xs"
                    style={{ minWidth: "900px" }}
                  >
                    {/* Judul */}
                    <thead>
                      <tr>
                        <td colSpan={11} className="border-0 px-4 pt-4 pb-1 text-center font-bold text-sm">
                          DATA LALU LINTAS ANGKUTAN UDARA
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={11} className="border-0 px-4 pb-1 text-center font-bold text-sm">
                          KANTOR UPBU KELAS I KALIMARAU
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={11} className="border-0 px-4 pb-1 text-center font-semibold">
                          TAHUN {filterTahun}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={11} className="border-0 px-4 pb-3 text-center text-muted-foreground">
                          Penerbangan : Domestik
                        </td>
                      </tr>

                      {/* Header kolom */}
                      <tr className="bg-sky-100 dark:bg-sky-900/40">
                        <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">BULAN</th>
                        <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">OPERATOR</th>
                        <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">PESAWAT</th>
                        <th colSpan={3} className="border border-gray-400 px-3 py-2 text-center font-bold">PENUMPANG</th>
                        <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">BAGASI</th>
                        <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">CARGO</th>
                      </tr>
                      <tr className="bg-sky-50 dark:bg-sky-900/20">
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">DATANG</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">BERANGKAT</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">DATANG</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">BERANGKAT</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">TRANSIT</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">DATANG</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">BERANGKAT</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">DATANG</th>
                        <th className="border border-gray-400 px-3 py-1 text-center font-semibold">BERANGKAT</th>
                      </tr>
                    </thead>

                    <tbody>
                      {monthDataList.map((month) => {
                        const bulanLabel = BULAN_LABELS[month.bulanIdx];
                        const hasData = month.operators.length > 0;

                        return (
                          <Fragment key={bulanLabel}>
                            {/* Baris operator */}
                            {hasData ? (
                              month.operators.map((row, idx) => (
                                <tr
                                  key={`${bulanLabel}-${row.operator}`}
                                  className="hover:bg-muted/20"
                                >
                                  {/* Nama bulan hanya di baris pertama */}
                                  {idx === 0 ? (
                                    <td
                                      rowSpan={month.operators.length + 1}
                                      className="border border-gray-300 px-3 py-1 text-center font-bold align-top bg-sky-50 dark:bg-sky-900/20"
                                    >
                                      {bulanLabel}
                                    </td>
                                  ) : null}
                                  <td className="border border-gray-300 px-3 py-1">{row.operator}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.dtgPswt)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.brkPswt)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.dtgPnp)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.brkPnp)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.transit)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.dtgBag)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.brkBag)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.dtgCargo)}</td>
                                  <td className="border border-gray-300 px-3 py-1 text-center">{fmt(row.brkCargo)}</td>
                                </tr>
                              ))
                            ) : (
                              // Bulan kosong — tidak ada data
                              <tr>
                                <td className="border border-gray-300 px-3 py-1 text-center font-bold bg-sky-50 dark:bg-sky-900/20">
                                  {bulanLabel}
                                </td>
                                <td className="border border-gray-300 px-3 py-1 text-muted-foreground text-center italic" colSpan={10}>
                                  —
                                </td>
                              </tr>
                            )}

                            {/* Baris TOTAL bulan */}
                            <tr className="bg-yellow-50 dark:bg-yellow-900/10 font-semibold">
                              {!hasData && null}
                              <td className="border border-gray-300 px-3 py-1 text-center font-bold">TOTAL</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.dtgPswt)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.brkPswt)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.dtgPnp)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.brkPnp)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.transit)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.dtgBag)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.brkBag)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.dtgCargo)}</td>
                              <td className="border border-gray-300 px-3 py-1 text-center">{fmt(month.total.brkCargo)}</td>
                            </tr>

                            {/* Separator antar bulan */}
                            <tr><td colSpan={11} className="border-0 h-1 bg-muted/40" /></tr>
                          </Fragment>
                        );
                      })}

                      {/* TOTAL / TAHUN */}
                      <tr className="bg-sky-200 dark:bg-sky-900/60 font-bold text-sm">
                        <td className="border border-gray-400 px-3 py-2 text-center font-bold" colSpan={2}>
                          TOTAL / TAHUN
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.dtgPswt)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.brkPswt)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.dtgPnp)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.brkPnp)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.transit)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.dtgBag)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.brkBag)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.dtgCargo)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{fmt(grandTotal.brkCargo)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

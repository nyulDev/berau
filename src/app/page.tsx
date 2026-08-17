"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { useEffect, useState } from "react";
import {
  Plane,
  Building2,
  TrendingUp,
  Users,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Flight = {
  id: string;
  tanggal: string;
  operator: string;
  datangDewasa: string | null;
  datangAnak: string | null;
  datangBayi: string | null;
  berangkatDewasa: string | null;
  berangkatAnak: string | null;
  berangkatBayi: string | null;
};

type Maskapai = {
  id: string;
  nama: string;
  kode: string;
  status: "active" | "inactive";
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-4xl font-bold mt-1">{value}</p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-green-500" />
            {sub}
          </p>
        )}
      </div>
      <div className={`rounded-full p-2.5 mt-1 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | Kalimarau International";
    Promise.all([
      fetch("/api/flights?page=1&limit=10000").then((r) => r.json()),
      fetch("/api/dashboard/maskapai").then((r) => r.json()),
    ])
      .then(([flightData, maskapaiData]) => {
        setFlights(flightData.flights || []);
        setMaskapaiList(Array.isArray(maskapaiData) ? maskapaiData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────
  const totalFlights = flights.length;
  const activeOperators = maskapaiList.filter((m) => m.status === "active").length;
  const inactiveOperators = maskapaiList.filter((m) => m.status === "inactive").length;

  const totalPenumpang = flights.reduce((sum, f) => {
    return (
      sum +
      (parseInt(f.datangDewasa || "0") || 0) +
      (parseInt(f.datangAnak || "0") || 0) +
      (parseInt(f.datangBayi || "0") || 0) +
      (parseInt(f.berangkatDewasa || "0") || 0) +
      (parseInt(f.berangkatAnak || "0") || 0) +
      (parseInt(f.berangkatBayi || "0") || 0)
    );
  }, 0);

  // ── Chart: flights per month (last 12 months) ─────────────────────
  const monthlyFlights = (() => {
    const map: Record<string, { datang: number; berangkat: number }> = {};
    flights.forEach((f) => {
      const d = new Date(f.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { datang: 0, berangkat: 0 };
      map[key].datang +=
        (parseInt(f.datangDewasa || "0") || 0) +
        (parseInt(f.datangAnak || "0") || 0) +
        (parseInt(f.datangBayi || "0") || 0);
      map[key].berangkat +=
        (parseInt(f.berangkatDewasa || "0") || 0) +
        (parseInt(f.berangkatAnak || "0") || 0) +
        (parseInt(f.berangkatBayi || "0") || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, val]) => {
        const [yr, mo] = key.split("-");
        const label = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleDateString(
          "id-ID",
          { month: "short", year: "2-digit" },
        );
        return { label, ...val };
      });
  })();

  // ── Top operators by flight count ─────────────────────────────────
  const topOperators = (() => {
    const map: Record<string, number> = {};
    flights.forEach((f) => {
      map[f.operator] = (map[f.operator] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  })();

  // ── Recent flights ─────────────────────────────────────────────────
  const recentFlights = [...flights]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Memuat data...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ringkasan data penerbangan Bandara Berau
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  label="Total Penerbangan"
                  value={totalFlights.toLocaleString("id-ID")}
                  icon={Plane}
                  color="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                />
                <StatCard
                  label="Total Penumpang"
                  value={totalPenumpang.toLocaleString("id-ID")}
                  icon={Users}
                  color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                />
                <StatCard
                  label="Maskapai Aktif"
                  value={activeOperators}
                  icon={Building2}
                  color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                />
                <StatCard
                  label="Maskapai Tidak Aktif"
                  value={inactiveOperators}
                  icon={TrendingUp}
                  color="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Bar Chart: Penumpang per Bulan */}
                <div className="xl:col-span-2 rounded-xl border bg-background shadow-sm p-5">
                  <h2 className="text-base font-semibold mb-1">Penumpang per Bulan</h2>
                  <p className="text-xs text-muted-foreground mb-4">Datang & Berangkat (12 bulan terakhir)</p>
                  {monthlyFlights.length === 0 ? (
                    <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                      Belum ada data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyFlights} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            fontSize: "12px",
                          }}
                          formatter={(v: number, name: string) => [
                            v.toLocaleString("id-ID"),
                            name === "datang" ? "Datang" : "Berangkat",
                          ]}
                        />
                        <Bar dataKey="datang" fill="#3b82f6" radius={[3, 3, 0, 0]} name="datang" />
                        <Bar dataKey="berangkat" fill="#10b981" radius={[3, 3, 0, 0]} name="berangkat" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Top Operators */}
                <div className="rounded-xl border bg-background shadow-sm p-5">
                  <h2 className="text-base font-semibold mb-1">Top Maskapai</h2>
                  <p className="text-xs text-muted-foreground mb-4">Berdasarkan jumlah penerbangan</p>
                  {topOperators.length === 0 ? (
                    <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                      Belum ada data
                    </div>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {topOperators.map((op, idx) => {
                        const max = topOperators[0].count;
                        const pct = Math.round((op.count / max) * 100);
                        return (
                          <div key={op.name}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium truncate max-w-[160px]">{op.name}</span>
                              <span className="text-muted-foreground text-xs">{op.count.toLocaleString("id-ID")} flight</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Flights */}
              <div className="rounded-xl border bg-background shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <div>
                    <h2 className="text-base font-semibold">Penerbangan Terbaru</h2>
                    <p className="text-xs text-muted-foreground">5 penerbangan terakhir yang tercatat</p>
                  </div>
                  <a href="/flights" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Lihat semua <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="divide-y">
                  {recentFlights.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                      Belum ada data penerbangan
                    </div>
                  ) : (
                    recentFlights.map((f) => {
                      const penumpang =
                        (parseInt(f.datangDewasa || "0") || 0) +
                        (parseInt(f.datangAnak || "0") || 0) +
                        (parseInt(f.datangBayi || "0") || 0);
                      return (
                        <div
                          key={f.id}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold border">
                            {f.operator.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{f.operator}</p>
                            <p className="text-xs text-muted-foreground">
                              <CalendarDays className="inline h-3 w-3 mr-1" />
                              {f.tanggal}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{penumpang > 0 ? `${penumpang.toLocaleString("id-ID")} penumpang` : "—"}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

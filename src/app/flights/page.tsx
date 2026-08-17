"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { FlightManagement } from "@/components/dashboard/flight-management";
import { useEffect, useState, useCallback } from "react";
import { Plane } from "lucide-react";

type Flight = { id: string; tanggal: string; operator: string };
type Maskapai = { id: string; nama: string; status: "active" | "inactive" };

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch maskapai (operators)
  useEffect(() => {
    document.title = "Flight Management | Kalimarau International";
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/maskapai")
      .then((r) => r.json())
      .then((d: Maskapai[]) => setMaskapaiList(d))
      .catch(() => {});
  }, []);

  const handleFlightsLoaded = useCallback((f: Flight[]) => {
    setFlights(f);
    setLoaded(true);
  }, []);

  const total = flights.length;

  // Active Now = jumlah operator/maskapai yang status active
  const activeNow = maskapaiList.filter((m) => m.status === "active").length;

  // Inactive = jumlah maskapai status inactive
  const inactiveCount = maskapaiList.filter((m) => m.status === "inactive").length;


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">

              {/* Page Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Flight Management</h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Manage and monitor all active flight schedules across global routes.
                  </p>
                </div>
                <FlightManagement.HeaderButtons />
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Flights */}
                <div className="rounded-xl border bg-background p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Flights</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-4xl font-bold">{loaded ? total : "—"}</span>
                      <span className="text-sm text-muted-foreground mb-1">flights</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 mt-1">
                    <Plane className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>

                {/* Active Now = operator active */}
                <div className="rounded-xl border bg-background p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active Airlines</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-4xl font-bold">{activeNow}</span>
                      <span className="text-sm text-muted-foreground mb-1">operators</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-teal-100 dark:bg-teal-900/40 p-2 mt-1">
                    <span className="flex h-5 w-5 items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg">✦</span>
                  </div>
                </div>

                {/* Inactive = maskapai tanpa penerbangan di bulan terpilih */}
                <div className="rounded-xl border bg-background p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inactive Airlines</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-4xl font-bold">{inactiveCount}</span>
                      <span className="text-sm text-muted-foreground mb-1">operators</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mt-1">
                    <span className="flex h-5 w-5 items-center justify-center text-gray-500 font-bold text-base">⏸</span>
                  </div>
                </div>
              </div>

              {/* Flight Management Table */}
              <FlightManagement
                onFlightsLoaded={handleFlightsLoaded}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

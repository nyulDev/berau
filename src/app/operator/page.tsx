"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { OperatorManagement } from "@/components/dashboard/operator-management";
import { useEffect, useState } from "react";

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  status: "active" | "inactive";
  createdAt?: string;
}

export default function OperatorPage() {
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [thisWeekCount, setThisWeekCount] = useState(0);

  useEffect(() => {
    document.title = "Operator Management | Kalimarau International";
    fetch("/api/dashboard/maskapai")
      .then((r) => r.json())
      .then((data: Maskapai[]) => {
        setMaskapaiList(data);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recent = data.filter(
          (m) => m.createdAt && new Date(m.createdAt) >= weekAgo,
        ).length;
        setThisWeekCount(recent);
      })
      .catch(() => {});
  }, []);

  const totalOperators = maskapaiList.length;
  const activeCount = maskapaiList.filter((m) => m.status === "active").length;
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
                <h1 className="text-3xl font-bold tracking-tight">
                  Operator Management
                </h1>
                <OperatorManagement.AddButton />
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Total Operators</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-4xl font-bold">{totalOperators}</span>
                    {thisWeekCount > 0 && (
                      <span className="text-sm text-green-600 mb-1">
                        +{thisWeekCount} this week
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Active Airlines</p>
                  <span className="text-4xl font-bold mt-1 block">{activeCount}</span>
                </div>
                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Inactive Airlines</p>
                  <span className="text-4xl font-bold mt-1 block">{inactiveCount}</span>
                </div>
              </div>

              {/* Table */}
              <OperatorManagement />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { OperatorManagement } from "@/components/dashboard/operator-management";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Page Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening with your store today.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                </div>
              </div>

              {/* Stats Cards */}
              <StatsCards />

              {/* Charts Section */}
              <ChartsSection />

              {/* Operator Management */}
              <OperatorManagement />

              {/* Recent Orders, Activities, and Quick Actions */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <RecentOrders />
                <div className="space-y-6">
                  <RecentActivities />
                  <QuickActions />
                </div>
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

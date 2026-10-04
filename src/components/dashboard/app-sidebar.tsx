"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Plane } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        {isCollapsed ? (
          /* Mode minimize: hanya tampil tombol expand di tengah */
          <div className="flex flex-col items-center gap-3">
            <Plane className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <SidebarTrigger />
          </div>
        ) : (
          /* Mode normal: logo + nama + tombol minimize */
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Plane className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg font-bold">Berau Sky-Logs</span>
            </Link>
            <SidebarTrigger className="flex-shrink-0" />
          </div>
        )}
      </SidebarHeader>

      {/* Nav Items */}
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Plane } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Logo + Toggle */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
            <Plane className="h-6 w-6 flex-shrink-0" />
            <span className="text-lg font-bold">
              Berau Sky-Logs
            </span>
          </Link>
          {/* Icon-only mode: tampilkan logo saja tanpa teks */}
          <Plane className="h-6 w-6 flex-shrink-0 hidden group-data-[collapsible=icon]:block mx-auto" />
          {/* Tombol toggle minimize/expand */}
          <SidebarTrigger className="flex-shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
        {/* Tombol expand saat sidebar sudah di-minimize */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center mt-2">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* Nav Items */}
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}

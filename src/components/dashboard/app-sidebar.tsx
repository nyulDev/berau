"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Plane } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Plane className="h-6 w-6 flex-shrink-0" />
          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
            Berau Sky-Logs
          </span>
        </Link>
      </SidebarHeader>

      {/* Nav Items */}
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}

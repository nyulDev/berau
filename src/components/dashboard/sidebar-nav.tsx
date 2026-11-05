"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Plane,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Operator",  url: "/operator", icon: Building2 },
  { title: "Flights",   url: "/flights",  icon: Plane },
  {
    title: "LLAU Excel",
    url: "/llau",
    icon: ClipboardList,
    subItems: [
      { title: "Master LLAU", url: "/llau/master" },
      { title: "Maskapai LLAU", url: "/llau/maskapai" },
      { title: "LLAU Tahunan", url: "/llau/tahunan" },
    ],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    subItems: [
      { title: "Table 1", url: "/reports/table1" },
      { title: "Table 2", url: "/reports/table2" },
      { title: "Table 3", url: "/reports/table3" },
      { title: "Table 4", url: "/reports/table4" },
      { title: "Table 5", url: "/reports/table5" },
      { title: "Table 6", url: "/reports/table6" },
      { title: "LLAU Word", url: "/reports/llau-word" },
      { title: "All Reports", url: "/reports/all" },
    ],
  },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <>
      {/* Main nav */}
      <SidebarGroup className="flex-1 pt-2">
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) =>
              item.subItems ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={isActive(item.url)}
                  className="group/collapsible mb-1"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          "w-full justify-between py-5 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950 dark:hover:text-sky-300",
                          isActive(item.url)
                            ? "bg-sky-100 text-sky-700 font-semibold dark:bg-sky-950 dark:text-sky-300"
                            : "",
                        )}
                      >                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.url}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === sub.url}
                              className={cn(
                                "transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950 dark:hover:text-sky-300",
                                pathname === sub.url &&
                                  "bg-sky-100 text-sky-700 font-semibold dark:bg-sky-950 dark:text-sky-300",
                              )}
                            >
                              <Link href={sub.url}>{sub.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className={cn(
                      "transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950 dark:hover:text-sky-300",
                      isActive(item.url) &&
                        "bg-sky-100 text-sky-700 font-semibold dark:bg-sky-950 dark:text-sky-300",
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3 py-5">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Logout at bottom */}
      <SidebarGroup className="mt-auto pb-4">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Logout"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

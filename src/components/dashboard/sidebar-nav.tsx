"use client";

import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  FileText,
  Calendar,
  TrendingUp,
  Plane,
  Plus,
  ChevronDown,
  ChevronRight,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  // {
  //   title: 'Analytics',
  //   url: '/analytics',
  //   icon: BarChart3,
  // },
  {
    title: "Operator",
    url: "/operator",
    icon: Plane,
  },
  // {
  //   title: 'Customers',
  //   url: '/customers',
  //   icon: Users,
  // },
  // {
  //   title: 'Orders',
  //   url: '/orders',
  //   icon: ShoppingCart,
  // },
  {
    title: "Flights",
    url: "/flights",
    icon: Package,
  },
  // {
  //   title: "Add Flight",
  //   url: "/flights/add",
  //   icon: Plus,
  // },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    subItems: [
      {
        title: "Table1 Reports",
        url: "/reports/table1",
      },
      {
        title: "Table2 Reports",
        url: "/reports/table2",
      },
      {
        title: "Table 3 Reports",
        url: "/reports/table3",
      },
      {
        title: "Table 4 Reports",
        url: "/reports/table4",
      },
      {
        title: "Table 5 Reports",
        url: "/reports/table5",
      },
      {
        title: "Table 6 Reports",
        url: "/reports/table6",
      },
      {
        title: "Report All",
        url: "/reports/all",
      },
    ],
  },
];

const secondaryNavItems: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) =>
              item.subItems ? (
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

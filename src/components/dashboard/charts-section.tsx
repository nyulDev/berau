"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function ChartsSection() {
  const monthlyData = [
    { month: "Jan", revenue: 2800, orders: 320 },
    { month: "Feb", revenue: 3200, orders: 380 },
    { month: "Mar", revenue: 4500, orders: 420 },
    { month: "Apr", revenue: 3800, orders: 390 },
    { month: "May", revenue: 5200, orders: 480 },
    { month: "Jun", revenue: 6100, orders: 550 },
    { month: "Jul", revenue: 5800, orders: 520 },
    { month: "Aug", revenue: 6900, orders: 610 },
    { month: "Sep", revenue: 7200, orders: 650 },
    { month: "Oct", revenue: 6500, orders: 580 },
    { month: "Nov", revenue: 7800, orders: 720 },
    { month: "Dec", revenue: 8200, orders: 780 },
  ];

  const weeklyData = [
    { day: "Mon", visitors: 400, sales: 120 },
    { day: "Tue", visitors: 380, sales: 115 },
    { day: "Wed", visitors: 420, sales: 130 },
    { day: "Thu", visitors: 480, sales: 145 },
    { day: "Fri", visitors: 520, sales: 165 },
    { day: "Sat", visitors: 580, sales: 185 },
    { day: "Sun", visitors: 620, sales: 200 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
          <CardDescription>Visitors vs Sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              visitors: {
                label: "Visitors",
                color: "hsl(var(--primary))",
              },
              sales: {
                label: "Sales",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="visitors"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sales"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>Monthly revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={monthlyData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

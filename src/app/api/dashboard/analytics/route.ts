import { NextResponse } from 'next/server'

export async function GET() {
  const monthlyData = [
    { month: 'Jan', revenue: 2800, orders: 320 },
    { month: 'Feb', revenue: 3200, orders: 380 },
    { month: 'Mar', revenue: 4500, orders: 420 },
    { month: 'Apr', revenue: 3800, orders: 390 },
    { month: 'May', revenue: 5200, orders: 480 },
    { month: 'Jun', revenue: 6100, orders: 550 },
    { month: 'Jul', revenue: 5800, orders: 520 },
    { month: 'Aug', revenue: 6900, orders: 610 },
    { month: 'Sep', revenue: 7200, orders: 650 },
    { month: 'Oct', revenue: 6500, orders: 580 },
    { month: 'Nov', revenue: 7800, orders: 720 },
    { month: 'Dec', revenue: 8200, orders: 780 },
  ]

  const weeklyData = [
    { day: 'Mon', visitors: 400, sales: 120 },
    { day: 'Tue', visitors: 380, sales: 115 },
    { day: 'Wed', visitors: 420, sales: 130 },
    { day: 'Thu', visitors: 480, sales: 145 },
    { day: 'Fri', visitors: 520, sales: 165 },
    { day: 'Sat', visitors: 580, sales: 185 },
    { day: 'Sun', visitors: 620, sales: 200 },
  ]

  return NextResponse.json({
    monthly: monthlyData,
    weekly: weeklyData,
  })
}

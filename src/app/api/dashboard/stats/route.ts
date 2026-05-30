import { NextResponse } from 'next/server'

export async function GET() {
  const stats = {
    totalRevenue: 45231.89,
    customers: 2350,
    orders: 12234,
    activeNow: 573,
    products: 1234,
    conversionRate: 3.24,
    changes: {
      revenue: 20.1,
      customers: 180.1,
      orders: 19,
      activeNow: 201,
      products: 4,
      conversionRate: -1.2,
    },
  }

  return NextResponse.json(stats)
}

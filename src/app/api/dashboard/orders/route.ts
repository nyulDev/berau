import { NextResponse } from 'next/server'

export async function GET() {
  const orders = [
    {
      id: '#ORD-1234',
      customer: 'John Doe',
      product: 'iPhone 15 Pro',
      amount: 999.00,
      status: 'completed',
      date: '2024-01-15',
    },
    {
      id: '#ORD-1233',
      customer: 'Jane Smith',
      product: 'MacBook Pro M3',
      amount: 2499.00,
      status: 'processing',
      date: '2024-01-15',
    },
    {
      id: '#ORD-1232',
      customer: 'Bob Johnson',
      product: 'AirPods Pro',
      amount: 249.00,
      status: 'pending',
      date: '2024-01-14',
    },
    {
      id: '#ORD-1231',
      customer: 'Alice Williams',
      product: 'iPad Pro',
      amount: 1099.00,
      status: 'completed',
      date: '2024-01-14',
    },
    {
      id: '#ORD-1230',
      customer: 'Charlie Brown',
      product: 'Apple Watch',
      amount: 399.00,
      status: 'cancelled',
      date: '2024-01-13',
    },
  ]

  return NextResponse.json(orders)
}

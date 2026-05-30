import { NextResponse } from 'next/server'

export async function GET() {
  const activities = [
    {
      id: '1',
      type: 'order',
      title: 'New Order #1234',
      description: 'John Doe placed an order for $299.00',
      time: '2 minutes ago',
      status: 'completed',
    },
    {
      id: '2',
      type: 'customer',
      title: 'New Customer Registered',
      description: 'Jane Smith created a new account',
      time: '15 minutes ago',
      status: 'completed',
    },
    {
      id: '3',
      type: 'product',
      title: 'Product Updated',
      description: 'iPhone 15 Pro stock updated to 45 units',
      time: '1 hour ago',
      status: 'completed',
    },
    {
      id: '4',
      type: 'order',
      title: 'Order #1233 Processing',
      description: 'Order is being prepared for shipment',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      id: '5',
      type: 'status',
      title: 'Payment Failed',
      description: 'Order #1232 payment could not be processed',
      time: '3 hours ago',
      status: 'failed',
    },
    {
      id: '6',
      type: 'order',
      title: 'Order #1231 Delivered',
      description: 'Order successfully delivered to customer',
      time: '5 hours ago',
      status: 'completed',
    },
    {
      id: '7',
      type: 'product',
      title: 'Low Stock Alert',
      description: 'MacBook Pro M3 stock is low (3 units)',
      time: '6 hours ago',
      status: 'pending',
    },
  ]

  return NextResponse.json(activities)
}

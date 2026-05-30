'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, Package, ShoppingCart } from 'lucide-react'

interface Activity {
  id: string
  type: 'order' | 'customer' | 'product' | 'status'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'failed'
}

const activities: Activity[] = [
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

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4 text-green-600" />,
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  failed: <XCircle className="h-4 w-4 text-red-600" />,
}

const typeIcons = {
  order: <ShoppingCart className="h-4 w-4" />,
  customer: <AvatarFallback className="h-8 w-8 text-xs">JD</AvatarFallback>,
  product: <Package className="h-4 w-4" />,
  status: <Badge variant="outline">Alert</Badge>,
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {statusIcons[activity.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

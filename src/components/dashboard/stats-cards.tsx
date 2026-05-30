'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, ShoppingCart, TrendingUp, Package, Activity } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ElementType
}

function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  const isPositive = changeType === 'positive'

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 ${!isPositive ? 'rotate-180' : ''}`} />
          {change} from last month
        </p>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Customers',
      value: '+2,350',
      change: '+180.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Orders',
      value: '+12,234',
      change: '+19%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Active Now',
      value: '+573',
      change: '+201 since last hour',
      changeType: 'positive' as const,
      icon: Activity,
    },
    {
      title: 'Products',
      value: '1,234',
      change: '+4%',
      changeType: 'positive' as const,
      icon: Package,
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

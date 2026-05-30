'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Package, FileText, BarChart3, Settings, Download, RefreshCw } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  action: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Add New Product',
    description: 'Create a new product listing',
    icon: Package,
    action: 'Add Product',
  },
  {
    title: 'Invite Customer',
    description: 'Send invitation to new customer',
    icon: Users,
    action: 'Invite',
  },
  {
    title: 'Generate Report',
    description: 'Create sales analytics report',
    icon: BarChart3,
    action: 'Generate',
  },
  {
    title: 'Export Data',
    description: 'Download customer data',
    icon: Download,
    action: 'Export',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 justify-start gap-4 hover:bg-muted/50"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
          
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure Quick Actions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

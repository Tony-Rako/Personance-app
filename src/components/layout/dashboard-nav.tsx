'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  User,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wealth Building', href: '/dashboard/wealth-building', icon: Target },
  { name: 'Budgeting', href: '/dashboard/budgeting', icon: PiggyBank },
  { name: 'Wealth Tracking', href: '/dashboard/wealth', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
          <span className="text-sm font-bold text-white">P</span>
        </div>
        <span className="text-xl font-bold text-gray-900">Personance</span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-1">
        {navigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

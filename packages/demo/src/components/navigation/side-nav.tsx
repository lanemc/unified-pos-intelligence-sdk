'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CreditCard,
  Package,
  Users,
  BarChart3,
  MessageSquare,
  Trophy,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: CreditCard,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Reviews',
    href: '/reviews',
    icon: MessageSquare,
    badge: 'New',
  },
  {
    title: 'Competitors',
    href: '/competitors',
    icon: Trophy,
    badge: 'Alert',
    badgeColor: 'bg-orange-500',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col border-r bg-gray-50">
      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-medium text-white',
                    item.badgeColor || 'bg-blue-500'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
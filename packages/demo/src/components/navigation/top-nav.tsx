'use client';

import { Bell, Search, User, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoStore } from '@/store/demo-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopNav() {
  const { currentMerchant, merchants, switchMerchant } = useDemoStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">POS Demo</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-start">
                {currentMerchant.businessName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Switch Merchant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {merchants.map((merchant) => (
                <DropdownMenuItem
                  key={merchant.id}
                  onClick={() => switchMerchant(merchant.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{merchant.businessName}</span>
                    <span className="text-xs text-muted-foreground">
                      {merchant.businessType} • {merchant.location}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-[200px] rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </Button>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Demo User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
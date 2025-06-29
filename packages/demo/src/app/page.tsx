'use client';

import { TopNav } from '@/components/navigation/top-nav';
import { SideNav } from '@/components/navigation/side-nav';
import { SDKIntegration } from '@/components/sdk-integration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDemoStore } from '@/store/demo-store';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Activity,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { currentMerchant, orders, triggerScenario, sdkEnabled } = useDemoStore();
  const { metrics } = currentMerchant;

  const kpiCards = [
    {
      title: 'Daily Revenue',
      value: `$${metrics.dailyRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: metrics.orderCount.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
    },
    {
      title: 'Avg Order Value',
      value: `$${metrics.averageOrderValue.toFixed(2)}`,
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
    },
    {
      title: 'Customers',
      value: metrics.customerCount.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
    },
  ];

  return (
    <div className="flex h-screen">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <TopNav />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600">
                Welcome to {currentMerchant.businessName}
              </p>
            </div>

            {/* SDK Integration */}
            <SDKIntegration />

            {/* Demo Scenario Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                  Demo Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      triggerScenario('morning-rush');
                      // Also trigger in iframe if SDK is available
                      if ((window as any).unifiedSDK) {
                        (window as any).unifiedSDK.triggerScenario('morning-rush');
                      }
                    }}
                    className="justify-start"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Morning Rush
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      triggerScenario('negative-review');
                      if ((window as any).unifiedSDK) {
                        (window as any).unifiedSDK.triggerScenario('negative-review');
                      }
                    }}
                    className="justify-start"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Negative Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      triggerScenario('competitor-price');
                      if ((window as any).unifiedSDK) {
                        (window as any).unifiedSDK.triggerScenario('competitor-price');
                      }
                    }}
                    className="justify-start"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Competitor Alert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      triggerScenario('low-inventory');
                      if ((window as any).unifiedSDK) {
                        (window as any).unifiedSDK.triggerScenario('low-inventory');
                      }
                    }}
                    className="justify-start"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Low Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards - Only show when SDK is disabled */}
            {!sdkEnabled && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((kpi) => (
                <Card key={kpi.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {kpi.title}
                    </CardTitle>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="flex items-center text-xs text-muted-foreground">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      <span className={kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {kpi.change}
                      </span>
                      <span className="ml-1">from last week</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {/* Recent Orders - Only show when SDK is disabled */}
            {!sdkEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="pos-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td className="font-medium">{order.orderNumber}</td>
                          <td>{order.customer}</td>
                          <td>{order.items.join(', ')}</td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'preparing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'ready'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="text-gray-500">
                            {new Date(order.time).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
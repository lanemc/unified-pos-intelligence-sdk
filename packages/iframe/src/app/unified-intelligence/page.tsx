'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  MessageSquare, 
  Trophy, 
  Hash, 
  Activity,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { communication } from '@/lib/communication';

export default function UnifiedIntelligencePage() {
  const [features, setFeatures] = useState({
    alerts: true,
    businessSentiment: true,
    competitorAnalysis: true,
    redditMonitoring: true,
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'Morning Rush Alert',
      message: 'Higher than usual order volume detected. Consider calling in additional staff.',
      severity: 'warning',
      time: '5 min ago',
      unread: true,
    },
    {
      id: '2',
      title: 'New Review',
      message: 'You received a new 5-star review on Google!',
      severity: 'info',
      time: '1 hour ago',
      unread: false,
    },
  ]);

  useEffect(() => {
    // Get features from handshake
    const receivedFeatures = communication.getFeatures();
    if (Object.keys(receivedFeatures).length > 0) {
      setFeatures(receivedFeatures as typeof features);
    }

    // Listen for scenario triggers
    communication.on('TRIGGER_SCENARIO', (message) => {
      const scenario = message.payload?.scenario;
      
      switch (scenario) {
        case 'morning-rush':
          setAlerts(prev => [{
            id: `alert-${Date.now()}`,
            title: 'Urgent: Morning Rush Detected',
            message: 'Order volume is 150% above normal. Immediate action required.',
            severity: 'critical',
            time: 'Just now',
            unread: true,
          }, ...prev]);
          break;
        case 'negative-review':
          setAlerts(prev => [{
            id: `alert-${Date.now()}`,
            title: 'Negative Review Alert',
            message: 'New 1-star review requires immediate response.',
            severity: 'warning',
            time: 'Just now',
            unread: true,
          }, ...prev]);
          break;
      }
    });

    return () => {
      communication.off('TRIGGER_SCENARIO');
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unified Intelligence</h1>
              <p className="text-sm text-gray-600">AI-powered insights for your business</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-brand-teal text-white border-brand-teal">
                Connected
              </Badge>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            {features.alerts && (
              <TabsTrigger value="alerts">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
                {alerts.filter(a => a.unread).length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {alerts.filter(a => a.unread).length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            {features.businessSentiment && (
              <TabsTrigger value="sentiment">
                <MessageSquare className="mr-2 h-4 w-4" />
                Sentiment
              </TabsTrigger>
            )}
            {features.competitorAnalysis && (
              <TabsTrigger value="competitors">
                <Trophy className="mr-2 h-4 w-4" />
                Competitors
              </TabsTrigger>
            )}
            {features.redditMonitoring && (
              <TabsTrigger value="reddit">
                <Hash className="mr-2 h-4 w-4" />
                Reddit
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.filter(a => a.unread).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {alerts.length} total alerts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.3</div>
                  <p className="text-xs text-muted-foreground">
                    +0.2 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Market Position</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#2</div>
                  <p className="text-xs text-muted-foreground">
                    In your area
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reddit Mentions</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest alerts and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                      </div>
                      <span className="text-xs">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operational Alerts</CardTitle>
                <CardDescription>
                  Real-time alerts for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center">
                          {alert.title}
                          {alert.unread && (
                            <Badge className="ml-2" variant="secondary">New</Badge>
                          )}
                        </h4>
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        </div>
                      </div>
                      <span className="text-xs">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Sentiment Analysis</CardTitle>
                <CardDescription>
                  AI-powered analysis of your customer reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Sentiment analysis will appear here
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    AI-generated insights from Google and Yelp reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>
                  Compare your performance with competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Competitor insights will appear here
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Side-by-side comparison with market leaders
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reddit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reddit Monitoring</CardTitle>
                <CardDescription>
                  Track and respond to Reddit mentions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Hash className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Reddit mentions will appear here
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor brand mentions and engage with your community
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
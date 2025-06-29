import { create } from 'zustand';

export interface DemoMerchant {
  id: string;
  businessName: string;
  businessType: 'restaurant' | 'retail' | 'cannabis' | 'service';
  location: string;
  logo?: string;
  metrics: {
    dailyRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    customerCount: number;
  };
  rating: number;
  reviewCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  time: Date;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  platform: 'google' | 'yelp';
  date: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface DemoState {
  // Current merchant
  currentMerchant: DemoMerchant;
  merchants: DemoMerchant[];
  
  // SDK state
  sdkEnabled: boolean;
  setSdkEnabled: (enabled: boolean) => void;
  
  // Demo data
  orders: Order[];
  reviews: Review[];
  
  // Actions
  switchMerchant: (merchantId: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReview: (review: Review) => void;
  
  // Scenarios
  triggerScenario: (scenario: 'morning-rush' | 'negative-review' | 'competitor-price' | 'low-inventory') => void;
}

// Demo merchants data
const demoMerchants: DemoMerchant[] = [
  {
    id: 'bellas-bistro',
    businessName: "Bella's Bistro",
    businessType: 'restaurant',
    location: 'San Francisco, CA',
    metrics: {
      dailyRevenue: 12847,
      orderCount: 156,
      averageOrderValue: 82.35,
      customerCount: 124,
    },
    rating: 4.3,
    reviewCount: 847,
  },
  {
    id: 'green-leaf',
    businessName: 'Green Leaf Dispensary',
    businessType: 'cannabis',
    location: 'Denver, CO',
    metrics: {
      dailyRevenue: 8923,
      orderCount: 89,
      averageOrderValue: 100.26,
      customerCount: 76,
    },
    rating: 4.7,
    reviewCount: 523,
  },
  {
    id: 'urban-threads',
    businessName: 'Urban Threads',
    businessType: 'retail',
    location: 'New York, NY',
    metrics: {
      dailyRevenue: 5632,
      orderCount: 42,
      averageOrderValue: 134.10,
      customerCount: 38,
    },
    rating: 4.1,
    reviewCount: 312,
  },
  {
    id: 'quick-stop',
    businessName: 'Quick Stop Market',
    businessType: 'service',
    location: 'Chicago, IL',
    metrics: {
      dailyRevenue: 3421,
      orderCount: 234,
      averageOrderValue: 14.62,
      customerCount: 189,
    },
    rating: 3.9,
    reviewCount: 156,
  },
];

// Initial demo orders
const initialOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#1234',
    customer: 'John Doe',
    items: ['Margherita Pizza', 'Caesar Salad'],
    total: 42.50,
    status: 'preparing',
    time: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '2',
    orderNumber: '#1235',
    customer: 'Jane Smith',
    items: ['Pasta Carbonara', 'Tiramisu'],
    total: 38.75,
    status: 'pending',
    time: new Date(Date.now() - 5 * 60000),
  },
];

// Initial demo reviews
const initialReviews: Review[] = [
  {
    id: '1',
    author: 'Michael R.',
    rating: 5,
    text: 'Amazing food and excellent service! The pasta was cooked perfectly.',
    platform: 'google',
    date: new Date(Date.now() - 2 * 24 * 60 * 60000),
    sentiment: 'positive',
  },
  {
    id: '2',
    author: 'Sarah L.',
    rating: 2,
    text: 'Waited 45 minutes for our order. Food was cold when it arrived.',
    platform: 'yelp',
    date: new Date(Date.now() - 1 * 24 * 60 * 60000),
    sentiment: 'negative',
  },
];

export const useDemoStore = create<DemoState>((set, get) => ({
  currentMerchant: demoMerchants[0],
  merchants: demoMerchants,
  sdkEnabled: true,
  orders: initialOrders,
  reviews: initialReviews,

  setSdkEnabled: (enabled) => set({ sdkEnabled: enabled }),

  switchMerchant: (merchantId) => {
    const merchant = demoMerchants.find((m) => m.id === merchantId);
    if (merchant) {
      set({ currentMerchant: merchant });
    }
  },

  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  addReview: (review) => set((state) => ({ reviews: [...state.reviews, review] })),

  triggerScenario: (scenario) => {
    switch (scenario) {
      case 'morning-rush':
        // Add multiple orders quickly
        const rushOrders: Order[] = Array.from({ length: 5 }, (_, i) => ({
          id: `rush-${i}`,
          orderNumber: `#${1240 + i}`,
          customer: `Customer ${i + 1}`,
          items: ['Coffee', 'Breakfast Sandwich'],
          total: 15.99,
          status: 'pending' as const,
          time: new Date(),
        }));
        set((state) => ({ orders: [...state.orders, ...rushOrders] }));
        break;

      case 'negative-review':
        const negativeReview: Review = {
          id: `neg-${Date.now()}`,
          author: 'Upset Customer',
          rating: 1,
          text: 'Terrible experience! Food took forever and was cold. Manager was rude.',
          platform: 'yelp',
          date: new Date(),
          sentiment: 'negative',
        };
        set((state) => ({ reviews: [negativeReview, ...state.reviews] }));
        break;

      case 'competitor-price':
        // This would trigger an alert in the iframe
        console.log('Competitor price change scenario triggered');
        break;

      case 'low-inventory':
        // This would trigger an inventory alert
        console.log('Low inventory scenario triggered');
        break;
    }
  },
}));
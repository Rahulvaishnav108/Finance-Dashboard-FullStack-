import { apiClient } from '../../../shared/services/apiClient';

export interface KitchenOrder {
  id: string;
  table: string;
  item: string;
  status: 'PLACED' | 'PREPARING' | 'READY' | 'DELAYED' | 'REJECTED';
  quantity: number;
  notes?: string;
  createdAt?: string;
}

export interface KitchenBatch {
  id: string;
  item: string;
  quantity: number;
  orders: string[]; // Order IDs included in this batch
  status: 'PENDING' | 'PREPARING' | 'READY';
  createdAt?: string;
}

export interface KitchenLoad {
  load: 'Low' | 'Medium' | 'High';
  activeOrdersCount: number;
}

export interface KitchenPerformance {
  avgPrepTime: string;
  efficiency: string;
  completedToday: number;
}

// Mock Data for Demo & Fallback
export const mockOrders: KitchenOrder[] = [
  { id: '1', table: 'T1', item: 'Paneer Butter Masala', status: 'PREPARING', quantity: 2, notes: 'Make it extra spicy' },
  { id: '2', table: 'T3', item: 'Veg Biryani', status: 'READY', quantity: 1 },
  { id: '3', table: 'T5', item: 'Chicken Curry', status: 'DELAYED', quantity: 3, notes: 'No onions' },
  { id: '4', table: 'T2', item: 'Garlic Naan', status: 'PLACED', quantity: 4 },
  { id: '5', table: 'T4', item: 'Paneer Butter Masala', status: 'PLACED', quantity: 1 }
];

export const mockBatches: KitchenBatch[] = [
  { id: 'b1', item: 'Paneer Butter Masala', quantity: 3, orders: ['1', '5'], status: 'PREPARING' }
];

export const mockLoad: KitchenLoad = {
  load: 'Medium',
  activeOrdersCount: 5
};

export const mockPerformance: KitchenPerformance = {
  avgPrepTime: '12 min',
  efficiency: '85%',
  completedToday: 24
};

// API calls with safe fallback to mock data on error/failure
export const getKitchenOrders = async (): Promise<KitchenOrder[]> => {
  try {
    const res = await apiClient.get('/api/v1/kitchen/orders');
    return res.data?.data || res.data || mockOrders;
  } catch (err) {
    console.warn('Using mock kitchen orders due to API error:', err);
    return mockOrders;
  }
};

export const acceptOrder = async (id: string): Promise<KitchenOrder> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/orders/${id}/accept`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Accepted order ${id}`);
    const order = mockOrders.find(o => o.id === id);
    if (order) order.status = 'PREPARING';
    return order || { id, table: '?', item: '?', status: 'PREPARING', quantity: 1 };
  }
};

export const startOrder = async (id: string): Promise<KitchenOrder> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/orders/${id}/start`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Started preparing order ${id}`);
    const order = mockOrders.find(o => o.id === id);
    if (order) order.status = 'PREPARING';
    return order || { id, table: '?', item: '?', status: 'PREPARING', quantity: 1 };
  }
};

export const readyOrder = async (id: string): Promise<KitchenOrder> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/orders/${id}/ready`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Marked order ${id} as ready`);
    const order = mockOrders.find(o => o.id === id);
    if (order) order.status = 'READY';
    return order || { id, table: '?', item: '?', status: 'READY', quantity: 1 };
  }
};

export const delayOrder = async (id: string): Promise<KitchenOrder> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/orders/${id}/delay`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Delayed order ${id}`);
    const order = mockOrders.find(o => o.id === id);
    if (order) order.status = 'DELAYED';
    return order || { id, table: '?', item: '?', status: 'DELAYED', quantity: 1 };
  }
};

export const rejectOrder = async (id: string): Promise<KitchenOrder> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/orders/${id}/reject`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Rejected order ${id}`);
    const order = mockOrders.find(o => o.id === id);
    if (order) order.status = 'REJECTED';
    return order || { id, table: '?', item: '?', status: 'REJECTED', quantity: 1 };
  }
};

export const getKitchenBatches = async (): Promise<KitchenBatch[]> => {
  try {
    const res = await apiClient.get('/api/v1/kitchen/batches');
    return res.data?.data || res.data || mockBatches;
  } catch (err) {
    console.warn('Using mock kitchen batches due to API error:', err);
    return mockBatches;
  }
};

export const createKitchenBatch = async (data: { item: string; orders: string[] }): Promise<KitchenBatch> => {
  try {
    const res = await apiClient.post('/api/v1/kitchen/batches', data);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Created batch for ${data.item}`);
    const newBatch: KitchenBatch = {
      id: `b-${Date.now()}`,
      item: data.item,
      quantity: data.orders.length,
      orders: data.orders,
      status: 'PENDING'
    };
    mockBatches.push(newBatch);
    return newBatch;
  }
};

export const updateKitchenBatchStatus = async (id: string, status: 'PENDING' | 'PREPARING' | 'READY'): Promise<KitchenBatch> => {
  try {
    const res = await apiClient.patch(`/api/v1/kitchen/batches/${id}`, { status });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`[Mock] Updated batch ${id} status to ${status}`);
    const batch = mockBatches.find(b => b.id === id);
    if (batch) {
      batch.status = status;
      // Also update orders in the batch
      batch.orders.forEach(orderId => {
        const order = mockOrders.find(o => o.id === orderId);
        if (order) {
          if (status === 'PREPARING') order.status = 'PREPARING';
          if (status === 'READY') order.status = 'READY';
        }
      });
    }
    return batch || { id, item: '?', quantity: 0, orders: [], status };
  }
};

export const getKitchenLoad = async (): Promise<KitchenLoad> => {
  try {
    const res = await apiClient.get('/api/v1/kitchen/load');
    return res.data?.data || res.data || mockLoad;
  } catch (err) {
    const activeOrders = mockOrders.filter(o => o.status !== 'READY' && o.status !== 'REJECTED');
    let load: 'Low' | 'Medium' | 'High' = 'Low';
    if (activeOrders.length > 5) {
      load = 'High';
    } else if (activeOrders.length > 2) {
      load = 'Medium';
    }
    return {
      load,
      activeOrdersCount: activeOrders.length
    };
  }
};

export const getKitchenPerformance = async (): Promise<KitchenPerformance> => {
  try {
    const res = await apiClient.get('/api/v1/kitchen/performance');
    return res.data?.data || res.data || mockPerformance;
  } catch (err) {
    return mockPerformance;
  }
};

export const acceptAllOrders = async (): Promise<KitchenOrder[]> => {
  try {
    const res = await apiClient.post('/api/v1/kitchen/orders/accept-all');
    return res.data?.data || res.data || mockOrders;
  } catch (err) {
    console.warn('[Mock] Accepted all placed orders');
    mockOrders.forEach(o => {
      if (o.status === 'PLACED') o.status = 'PREPARING';
    });
    return mockOrders;
  }
};

export const delayAllOrders = async (): Promise<KitchenOrder[]> => {
  try {
    const res = await apiClient.post('/api/v1/kitchen/orders/delay-all');
    return res.data?.data || res.data || mockOrders;
  } catch (err) {
    console.warn('[Mock] Delayed all preparing orders');
    mockOrders.forEach(o => {
      if (o.status === 'PREPARING') o.status = 'DELAYED';
    });
    return mockOrders;
  }
};

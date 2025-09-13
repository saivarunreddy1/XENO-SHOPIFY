import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class OrderService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getAllOrders(page = null, size = null, status = null, customerId = null, startDate = null, endDate = null) {
    try {
      const params = {};
      if (page !== null) params.page = page;
      if (size !== null) params.size = size;
      if (status) params.status = status;
      if (customerId) params.customerId = customerId;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await this.axiosInstance.get('/orders', { params });
      return response.data.map(order => ({
        ...order,
        orderDate: new Date(order.orderDate),
        shippedDate: order.shippedDate ? new Date(order.shippedDate) : null,
        deliveredDate: order.deliveredDate ? new Date(order.deliveredDate) : null,
        customer: order.customer || { fullName: order.customerName || 'Unknown', email: order.customerEmail || '' }
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Return mock data as fallback
      return this.getMockOrders();
    }
  }

  async getOrderById(id) {
    try {
      const response = await this.axiosInstance.get(`/orders/${id}`);
      return {
        ...response.data,
        orderDate: new Date(response.data.orderDate),
        shippedDate: response.data.shippedDate ? new Date(response.data.shippedDate) : null,
        deliveredDate: response.data.deliveredDate ? new Date(response.data.deliveredDate) : null,
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async createOrder(order) {
    try {
      const response = await this.axiosInstance.post('/orders', order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(id, order) {
    try {
      const response = await this.axiosInstance.put(`/orders/${id}`, order);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(id) {
    try {
      await this.axiosInstance.delete(`/orders/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const response = await this.axiosInstance.get('/orders/recent', {
        params: { limit }
      });
      return response.data.map(order => ({
        ...order,
        orderDate: new Date(order.orderDate),
        shippedDate: order.shippedDate ? new Date(order.shippedDate) : null,
        deliveredDate: order.deliveredDate ? new Date(order.deliveredDate) : null,
        customer: order.customer || { fullName: order.customerName || 'Unknown', email: order.customerEmail || '' }
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return this.getMockOrders().slice(0, limit);
    }
  }

  async getOrderStats(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await this.axiosInstance.get('/orders/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        statusCounts: {},
        recentOrders: [],
        periodOrders: 0,
        periodRevenue: 0
      };
    }
  }

  async getDailyAnalytics(startDate, endDate) {
    try {
      const response = await this.axiosInstance.get('/orders/analytics/daily', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data.map(row => ({
        date: new Date(row[0]),
        orderCount: row[1],
        revenue: row[2]
      }));
    } catch (error) {
      console.error('Error fetching daily analytics:', error);
      return [];
    }
  }

  // Order lifecycle operations
  async confirmOrder(orderId) {
    try {
      const response = await this.axiosInstance.post(`/orders/${orderId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }

  async shipOrder(orderId, trackingNumber) {
    try {
      const response = await this.axiosInstance.post(`/orders/${orderId}/ship`, null, {
        params: { trackingNumber }
      });
      return response.data;
    } catch (error) {
      console.error('Error shipping order:', error);
      throw error;
    }
  }

  async deliverOrder(orderId) {
    try {
      const response = await this.axiosInstance.post(`/orders/${orderId}/deliver`);
      return response.data;
    } catch (error) {
      console.error('Error delivering order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, reason) {
    try {
      const response = await this.axiosInstance.post(`/orders/${orderId}/cancel`, null, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Fallback mock data
  getMockOrders() {
    return [
      {
        id: 1,
        orderId: 'ORD-001',
        customer: { fullName: 'John Smith', email: 'john@example.com' },
        status: 'SHIPPED',
        totalAmount: 299.99,
        orderDate: new Date('2024-01-15T10:30:00'),
        shippedDate: new Date('2024-01-16T14:20:00'),
        trackingNumber: 'TRK123456789',
        shippingAddress: '123 Main St, City, State 12345',
        orderItems: [
          { productName: 'Wireless Headphones', quantity: 1, unitPrice: 199.99 },
          { productName: 'Phone Case', quantity: 2, unitPrice: 50.00 }
        ]
      },
      {
        id: 2,
        orderId: 'ORD-002',
        customer: { fullName: 'Jane Doe', email: 'jane@example.com' },
        status: 'PROCESSING',
        totalAmount: 149.50,
        orderDate: new Date('2024-01-16T09:15:00'),
        shippingAddress: '456 Oak Ave, Town, State 67890',
        orderItems: [
          { productName: 'Smart Watch', quantity: 1, unitPrice: 149.50 }
        ]
      },
      {
        id: 3,
        orderId: 'ORD-003',
        customer: { fullName: 'Mike Johnson', email: 'mike@example.com' },
        status: 'DELIVERED',
        totalAmount: 75.25,
        orderDate: new Date('2024-01-14T16:45:00'),
        shippedDate: new Date('2024-01-15T11:30:00'),
        deliveredDate: new Date('2024-01-16T15:20:00'),
        trackingNumber: 'TRK987654321',
        shippingAddress: '789 Pine St, Village, State 11111',
        orderItems: [
          { productName: 'Bluetooth Speaker', quantity: 1, unitPrice: 75.25 }
        ]
      },
      {
        id: 4,
        orderId: 'ORD-004',
        customer: { fullName: 'Sarah Wilson', email: 'sarah@example.com' },
        status: 'PENDING',
        totalAmount: 420.00,
        orderDate: new Date('2024-01-16T14:20:00'),
        shippingAddress: '321 Elm St, City, State 22222',
        orderItems: [
          { productName: 'Laptop Stand', quantity: 2, unitPrice: 89.99 },
          { productName: 'Wireless Mouse', quantity: 1, unitPrice: 49.99 },
          { productName: 'Keyboard', quantity: 1, unitPrice: 189.99 }
        ]
      }
    ];
  }
}

export default new OrderService();

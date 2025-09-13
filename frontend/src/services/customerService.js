import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class CustomerService {
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

  async getAllCustomers(page = null, size = null, search = null) {
    try {
      const params = {};
      if (page !== null) params.page = page;
      if (size !== null) params.size = size;
      if (search) params.search = search;

      const response = await this.axiosInstance.get('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return mock data as fallback
      return this.getMockCustomers();
    }
  }

  async getCustomerById(id) {
    try {
      const response = await this.axiosInstance.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  async createCustomer(customer) {
    try {
      const response = await this.axiosInstance.post('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id, customer) {
    try {
      const response = await this.axiosInstance.put(`/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id) {
    try {
      await this.axiosInstance.delete(`/customers/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  async getTopCustomers(limit = 10) {
    try {
      const response = await this.axiosInstance.get('/customers/top-spenders', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      return [];
    }
  }

  async getCustomerStats() {
    try {
      const response = await this.axiosInstance.get('/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      return {
        totalCustomers: 0,
        totalRevenue: 0,
        returningCustomers: [],
        newCustomers: []
      };
    }
  }

  // Fallback mock data
  getMockCustomers() {
    return [
      {
        id: 1,
        customerId: 'CUST-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        totalSpent: 1250.75,
        ordersCount: 8,
        createdAt: new Date('2023-06-15T10:30:00'),
        lastOrderDate: new Date('2024-01-15T14:20:00'),
      },
      {
        id: 2,
        customerId: 'CUST-002',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
        totalSpent: 875.25,
        ordersCount: 5,
        createdAt: new Date('2023-08-22T14:45:00'),
        lastOrderDate: new Date('2024-01-16T11:30:00'),
      },
      {
        id: 3,
        customerId: 'CUST-003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1 (555) 456-7890',
        address: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601',
        totalSpent: 2150.00,
        ordersCount: 12,
        createdAt: new Date('2023-03-10T09:20:00'),
        lastOrderDate: new Date('2024-01-14T16:45:00'),
      }
    ];
  }
}

export default new CustomerService();

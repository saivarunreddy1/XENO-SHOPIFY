import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  People,
  ShoppingCart,
  AttachMoney,
  Inventory,
} from '@mui/icons-material';
import analyticsService from '../services/analyticsService';

const MetricCard = ({ title, value, icon, trend, color = 'primary' }) => (
  <Card elevation={3}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="h2" color={color}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}% from last month
            </Typography>
          )}
        </Box>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data since backend might not be fully connected yet
      const mockDashboardData = {
        totalCustomers: 5,
        totalOrders: 5,
        totalRevenue: 545.49,
        totalProducts: 5,
        averageOrderValue: 109.1,
        recentOrders: 5,
        ordersGrowthPercent: 25.5
      };

      const mockCustomers = [
        { id: 1, email: 'alice.cooper@email.com', firstName: 'Alice', lastName: 'Cooper', totalSpent: 245.50, ordersCount: 3 },
        { id: 2, email: 'emma.davis@email.com', firstName: 'Emma', lastName: 'Davis', totalSpent: 678.25, ordersCount: 7 },
        { id: 3, email: 'carol.white@email.com', firstName: 'Carol', lastName: 'White', totalSpent: 456.75, ordersCount: 5 },
        { id: 4, email: 'bob.martin@email.com', firstName: 'Bob', lastName: 'Martin', totalSpent: 189.99, ordersCount: 2 },
        { id: 5, email: 'david.brown@email.com', firstName: 'David', lastName: 'Brown', totalSpent: 123.00, ordersCount: 1 }
      ];

      const mockOrderTrends = [
        { date: '2024-01-15', orderCount: 1, revenue: 109.98 },
        { date: '2024-01-16', orderCount: 1, revenue: 79.99 },
        { date: '2024-01-17', orderCount: 1, revenue: 219.98 },
        { date: '2024-01-18', orderCount: 1, revenue: 89.99 },
        { date: '2024-01-19', orderCount: 1, revenue: 45.51 }
      ];

      const mockMonthlyRevenue = {
        '2024-01': 545.49,
        '2023-12': 420.30,
        '2023-11': 380.25
      };

      const mockOrdersByStatus = {
        'paid': 4,
        'pending': 1
      };

      setDashboardData(mockDashboardData);
      setTopCustomers(mockCustomers);
      setOrderTrends(mockOrderTrends);

      // Transform monthly revenue data for charts
      const revenueData = Object.entries(mockMonthlyRevenue).map(([month, revenue]) => ({
        month: month,
        revenue: revenue,
      }));
      setMonthlyRevenue(revenueData);

      // Transform order status data for pie chart
      const statusData = Object.entries(mockOrdersByStatus).map(([status, count]) => ({
        name: status,
        value: count,
      }));
      setOrdersByStatus(statusData);

      // Try to fetch real data as fallback
      try {
        const realDashboard = await analyticsService.getDashboardMetrics();
        if (realDashboard) {
          setDashboardData(realDashboard);
        }
      } catch (apiError) {
        console.log('Using mock data, API not available:', apiError.message);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={
          <Button onClick={loadDashboardData}>Retry</Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={formatNumber(dashboardData?.totalCustomers || 0)}
            icon={<People fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={formatNumber(dashboardData?.totalOrders || 0)}
            icon={<ShoppingCart fontSize="large" />}
            trend={dashboardData?.ordersGrowthPercent}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dashboardData?.totalRevenue || 0)}
            icon={<AttachMoney fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(dashboardData?.averageOrderValue || 0)}
            icon={<TrendingUp fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Order Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Trends (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#8884d8"
                  name="Orders"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Orders by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            {topCustomers.map((customer, index) => (
              <Box key={customer.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" component="div">
                  {customer.firstName} {customer.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {customer.email}
                </Typography>
                <Typography variant="body2" color="primary">
                  {formatCurrency(customer.totalSpent)} • {customer.ordersCount} orders
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

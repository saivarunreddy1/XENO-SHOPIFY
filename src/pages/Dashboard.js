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
  Chip,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  People,
  ShoppingCart,
  AttachMoney,
  Inventory,
  FilterList,
  TrendingDown,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import analyticsService from '../services/analyticsService';

// Icon aliases for better readability
const PeopleIcon = People;
const OrdersIcon = ShoppingCart;
const RevenueIcon = AttachMoney;
const TrendingIcon = TrendingUp;

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

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
            <Box display="flex" alignItems="center" mt={0.5}>
              {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography 
                variant="body2" 
                color={trend > 0 ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {trend > 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TopCustomersTable = ({ customers = [] }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Customer</TableCell>
          <TableCell align="right">Total Spent</TableCell>
          <TableCell align="right">Orders</TableCell>
          <TableCell align="right">Avg Order</TableCell>
          <TableCell align="right">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {customers.map((customer, index) => {
          const customerName = customer?.name || 'Unknown Customer';
          const customerEmail = customer?.email || 'No email';
          const totalSpent = customer?.totalSpent || 0;
          const orderCount = customer?.orderCount || 0;
          const avgOrder = orderCount > 0 ? (totalSpent / orderCount) : 0;
          
          // Determine customer tier based on spending
          let customerTier = 'Bronze';
          let tierColor = '#CD7F32';
          if (totalSpent > 2000) {
            customerTier = 'Diamond';
            tierColor = '#B9F2FF';
          } else if (totalSpent > 1500) {
            customerTier = 'Platinum';
            tierColor = '#E5E4E2';
          } else if (totalSpent > 1000) {
            customerTier = 'Gold';
            tierColor = '#FFD700';
          } else if (totalSpent > 500) {
            customerTier = 'Silver';
            tierColor = '#C0C0C0';
          }
          
          return (
            <TableRow key={customer?.id || index} hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ 
                    mr: 2, 
                    bgcolor: COLORS[index % COLORS.length],
                    width: 45,
                    height: 45,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {customerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {customerName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {customerEmail}
                    </Typography>
                    {customer?.lastOrderDate && (
                      <Typography variant="caption" color="textSecondary">
                        Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {orderCount}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">
                  ${avgOrder.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={customerTier}
                  size="small"
                  sx={{
                    bgcolor: tierColor,
                    color: customerTier === 'Diamond' ? 'black' : 'white',
                    fontWeight: 'bold',
                    minWidth: 70
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({});
  const [topCustomers, setTopCustomers] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [customerAcquisition, setCustomerAcquisition] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());

  const { user } = useAuth();
  const { currentTenant, tenantData } = useTenant();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, customersData, trendsData, revenueData, statusData, productsData, acquisitionData, ordersData] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getTopCustomers(5),
        analyticsService.getOrderTrends(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')),
        analyticsService.getMonthlyRevenue(),
        analyticsService.getOrdersByStatus(),
        analyticsService.getTopProducts(5),
        analyticsService.getCustomerAcquisition(30),
        analyticsService.getRecentOrders(8)
      ]);

      console.log('Dashboard data loaded:', {
        metrics: metricsData,
        customers: customersData,
        trends: trendsData,
        revenue: revenueData,
        status: statusData,
        products: productsData,
        acquisition: acquisitionData,
        orders: ordersData
      });
      
      setMetrics(metricsData);
      setTopCustomers(customersData);
      setOrderTrends(trendsData);
      setMonthlyRevenue(revenueData);
      setOrdersByStatus(statusData);
      setTopProducts(productsData);
      setCustomerAcquisition(acquisitionData);
      setRecentOrders(ordersData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentTenant]);

  const handleDateFilterApply = () => {
    loadDashboardData();
  };

  // Transform order status data for pie chart
  const orderStatusData = Object.entries(ordersByStatus || {}).map(([status, count]) => ({
    name: status,
    value: count || 0
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadDashboardData} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName}! Here's your {tenantData?.storeName || 'store'} performance insights.
          </Typography>
        </Box>

        {/* Date Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <FilterList color="action" />
              <Typography variant="h6">Date Range Filter</Typography>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
              <Button 
                variant="contained" 
                onClick={handleDateFilterApply}
                startIcon={<FilterList />}
              >
                Apply Filter
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Total Customers"
              value={metrics.totalCustomers?.toLocaleString() || '0'}
              icon={<PeopleIcon fontSize="large" />}
              color="primary"
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders?.toLocaleString() || '0'}
              icon={<OrdersIcon fontSize="large" />}
              color="success"
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue?.toLocaleString() || '0'}`}
              icon={<RevenueIcon fontSize="large" />}
              color="warning"
              trend={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate || 0}%`}
              icon={<TrendingIcon fontSize="large" />}
              color="secondary"
              trend={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Avg Order Value"
              value={`$${metrics.avgOrderValue?.toFixed(2) || '0'}`}
              icon={<AttachMoney fontSize="large" />}
              color="info"
              trend={-2.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MetricCard
              title="Repeat Rate"
              value={`${metrics.repeatCustomerRate || 0}%`}
              icon={<Star fontSize="large" />}
              color="error"
              trend={5.8}
            />
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Orders by Date Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders & Revenue Trends
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={orderTrends && orderTrends.length > 0 ? orderTrends : [{ date: 'No Data', orders: 0, revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(1)}k`}
                        label={{ value: 'Revenue', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="orders" 
                        stroke={CHART_COLORS.primary} 
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        name="Daily Orders" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={CHART_COLORS.success} 
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        name="Daily Revenue ($)" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Status Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders by Status
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Monthly Revenue */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Revenue
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={monthlyRevenue && monthlyRevenue.length > 0 ? monthlyRevenue : [{ month: 'No Data', revenue: 0, orders: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill={CHART_COLORS.warning} 
                        radius={[4, 4, 0, 0]}
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Acquisition */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Acquisition
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={customerAcquisition}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="newCustomers" stackId="1" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} />
                      <Area type="monotone" dataKey="returningCustomers" stackId="1" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Grid container spacing={3}>
          {/* Top 5 Customers */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 1 }} />
                  Top 5 Customers by Spend
                </Typography>
                <TopCustomersTable customers={topCustomers || []} />
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <OrdersIcon sx={{ mr: 1 }} />
                  Recent Orders
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => (
                      <Box
                        key={order.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                          px: 1,
                          borderBottom: '1px solid #f0f0f0',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child': { borderBottom: 'none', mb: 0 }
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                              {order.id}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={
                                order.status === 'Completed' ? 'success' :
                                order.status === 'Shipped' ? 'info' :
                                order.status === 'Processing' ? 'warning' : 'default'
                              }
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                            {order.customer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.product}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {new Date(order.date).toLocaleDateString()} • {order.time}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', ml: 2 }}>
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            ${order.amount}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" py={4}>
                      No recent orders
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Additional Analytics Row */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Business Insights Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 1 }} />
                  Business Performance Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {metrics.totalCustomers > 1000 ? `${(metrics.totalCustomers/1000).toFixed(1)}K` : metrics.totalCustomers || '0'}
                      </Typography>
                      <Typography variant="body2">Active Customers</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {orderTrends.length > 0 ? 
                          `$${(orderTrends.reduce((sum, day) => sum + (day?.revenue || 0), 0) / Math.max(1, orderTrends.length)).toFixed(0)}` : '$0'}
                      </Typography>
                      <Typography variant="body2">Daily Avg Revenue</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {topProducts && topProducts.length > 0 ? topProducts[0]?.sales || 0 : 0}
                      </Typography>
                      <Typography variant="body2">Top Product Sales</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {orderStatusData.length > 0 ? 
                          orderStatusData.find(item => item?.name === 'Completed')?.percentage || '0' : '0'}%
                      </Typography>
                      <Typography variant="body2">Completion Rate</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;

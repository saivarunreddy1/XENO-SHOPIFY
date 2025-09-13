import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button
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
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { Analytics as AnalyticsIcon, TrendingUp, Assessment, Insights } from '@mui/icons-material';
import analyticsService from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [orderTrends, setOrderTrends] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerAcquisition, setCustomerAcquisition] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  
  const { user } = useAuth();
  const { currentTenant, tenantData } = useTenant();

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [trends, revenue, products, acquisition, status] = await Promise.all([
        analyticsService.getOrderTrends(null, null, parseInt(timeRange)),
        analyticsService.getMonthlyRevenue(),
        analyticsService.getTopProducts(10),
        analyticsService.getCustomerAcquisition(parseInt(timeRange)),
        analyticsService.getOrdersByStatus()
      ]);
      
      setOrderTrends(trends);
      setMonthlyRevenue(revenue);
      setTopProducts(products);
      setCustomerAcquisition(acquisition);
      setOrdersByStatus(status);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currentTenant, timeRange]);

  const orderStatusData = Object.entries(ordersByStatus || {}).map(([status, count]) => {
    const totalOrders = Object.values(ordersByStatus || {}).reduce((a, b) => a + b, 0);
    return {
      name: status,
      value: count || 0,
      percentage: totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : '0'
    };
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Assessment sx={{ mr: 2 }} />
            Advanced Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deep insights for {tenantData?.storeName || 'your store'} - {user?.firstName}
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Detailed Charts */}
      <Grid container spacing={3}>
        {/* Combined Order & Revenue Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                Order & Revenue Trends Analysis
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Daily Orders" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} name="Revenue ($)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue Analysis */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Performance
              </Typography>
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0088FE" name="Revenue ($)" />
                    <Bar dataKey="orders" fill="#00C49F" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
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

        {/* Customer Acquisition Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Acquisition Trends
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={customerAcquisition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="newCustomers" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="New Customers"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="returningCustomers" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Returning Customers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products Performance
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value, name) => [value, name === 'sales' ? 'Units Sold' : 'Revenue']} />
                    <Legend />
                    <Bar dataKey="sales" fill="#FFBB28" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Insights sx={{ mr: 1 }} />
                Key Business Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                    <Typography variant="h4">
                      {customerAcquisition.length > 0 ? 
                        ((customerAcquisition.reduce((sum, day) => sum + (day?.returningCustomers || 0), 0) / 
                         customerAcquisition.reduce((sum, day) => sum + (day?.newCustomers || 0) + (day?.returningCustomers || 0), 0)) * 100).toFixed(1) : '0'}%
                    </Typography>
                    <Typography variant="body2">Customer Retention Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                    <Typography variant="h4">
                      ${orderTrends.length > 0 ? 
                        (orderTrends.reduce((sum, day) => sum + (day?.revenue || 0), 0) / 
                         Math.max(1, orderTrends.reduce((sum, day) => sum + (day?.orders || 0), 0))).toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="body2">Average Order Value</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'white' }}>
                    <Typography variant="h4">
                      {(topProducts && topProducts.length > 0) ? topProducts[0]?.name || 'N/A' : 'N/A'}
                    </Typography>
                    <Typography variant="body2">Best Selling Product</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'white' }}>
                    <Typography variant="h4">
                      {(orderStatusData && orderStatusData.length > 0) ? 
                        (orderStatusData.find(item => item?.name === 'Completed')?.percentage || '0') : '0'}%
                    </Typography>
                    <Typography variant="body2">Order Completion Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;

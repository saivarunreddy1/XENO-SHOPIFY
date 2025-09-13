import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const statusColors = {
  'PENDING': 'warning',
  'CONFIRMED': 'info', 
  'PROCESSING': 'primary',
  'SHIPPED': 'secondary',
  'DELIVERED': 'success',
  'CANCELLED': 'error',
  'REFUNDED': 'error'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderService = await import('../services/orderService');
      const data = await orderService.default.getAllOrders();
      
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to mock data if API fails
      const mockData = [
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
        }
      ];
      setOrders(mockData);
      setFilteredOrders(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const getOrderProgress = (order) => {
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const getTrackingInfo = (order) => {
    const events = [];
    
    events.push({
      status: 'Order Placed',
      date: order.orderDate,
      completed: true
    });
    
    if (order.status !== 'PENDING') {
      events.push({
        status: 'Order Confirmed',
        date: order.orderDate,
        completed: true
      });
    }
    
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'Processing',
        date: order.orderDate,
        completed: true
      });
    }
    
    if (['SHIPPED', 'DELIVERED'].includes(order.status) && order.shippedDate) {
      events.push({
        status: 'Shipped',
        date: order.shippedDate,
        completed: true
      });
    }
    
    if (order.status === 'DELIVERED' && order.deliveredDate) {
      events.push({
        status: 'Delivered',
        date: order.deliveredDate,
        completed: true
      });
    }
    
    return events;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Orders</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders by ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredOrders.length} of {orders.length} orders
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {order.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {order.customer.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.customer.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${order.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(order.orderDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(order.orderDate, 'hh:mm a')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewOrder(order)}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <ReceiptIcon />
                Order Details - {selectedOrder.orderId}
                <Chip
                  label={selectedOrder.status}
                  color={statusColors[selectedOrder.status] || 'default'}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Customer Information
                      </Typography>
                      <Typography><strong>Name:</strong> {selectedOrder.customer.fullName}</Typography>
                      <Typography><strong>Email:</strong> {selectedOrder.customer.email}</Typography>
                      <Typography><strong>Shipping Address:</strong></Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedOrder.shippingAddress}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <DateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Order Information
                      </Typography>
                      <Typography><strong>Order Date:</strong> {format(selectedOrder.orderDate, 'MMM dd, yyyy hh:mm a')}</Typography>
                      {selectedOrder.shippedDate && (
                        <Typography><strong>Shipped Date:</strong> {format(selectedOrder.shippedDate, 'MMM dd, yyyy hh:mm a')}</Typography>
                      )}
                      {selectedOrder.deliveredDate && (
                        <Typography><strong>Delivered Date:</strong> {format(selectedOrder.deliveredDate, 'MMM dd, yyyy hh:mm a')}</Typography>
                      )}
                      <Typography><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order Items */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Order Items
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.orderItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                              <TableCell align="right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tracking Information */}
                {['SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && selectedOrder.trackingNumber && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Tracking Information
                        </Typography>
                        <Typography><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</Typography>
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="body2" gutterBottom>Order Progress:</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={getOrderProgress(selectedOrder)} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <List dense>
                          {getTrackingInfo(selectedOrder).map((event, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemText
                                primary={event.status}
                                secondary={format(event.date, 'MMM dd, yyyy hh:mm a')}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    color: event.completed ? 'success.main' : 'text.secondary',
                                    fontWeight: event.completed ? 'bold' : 'normal'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Orders;

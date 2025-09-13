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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customerService = await import('../services/customerService');
      const data = await customerService.default.getAllCustomers();
      
      // Add mock orders to each customer for display
      const customersWithOrders = data.map(customer => ({
        ...customer,
        createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate) : new Date(),
        orders: [
          { orderId: `ORD-${String(customer.id).padStart(3, '0')}`, date: new Date(), total: customer.totalSpent * 0.3, status: 'DELIVERED' },
          { orderId: `ORD-${String(customer.id + 100).padStart(3, '0')}`, date: new Date(Date.now() - 86400000), total: customer.totalSpent * 0.4, status: 'DELIVERED' },
          { orderId: `ORD-${String(customer.id + 200).padStart(3, '0')}`, date: new Date(Date.now() - 172800000), total: customer.totalSpent * 0.3, status: 'PROCESSING' },
        ]
      }));
      
      setCustomers(customersWithOrders);
      setFilteredCustomers(customersWithOrders);
    } catch (error) {
      console.error('Error loading customers:', error);
      // Fallback to mock data if API fails
      const mockData = [
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
          orders: [
            { orderId: 'ORD-001', date: new Date('2024-01-15T14:20:00'), total: 299.99, status: 'DELIVERED' },
            { orderId: 'ORD-005', date: new Date('2024-01-10T09:15:00'), total: 150.50, status: 'DELIVERED' },
            { orderId: 'ORD-012', date: new Date('2023-12-20T16:45:00'), total: 89.99, status: 'DELIVERED' },
          ]
        }
      ];
      setCustomers(mockData);
      setFilteredCustomers(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = customers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const getCustomerSegment = (customer) => {
    if (customer.totalSpent >= 1000) return { label: 'VIP', color: 'success' };
    if (customer.totalSpent >= 500) return { label: 'Premium', color: 'primary' };
    if (customer.ordersCount === 1) return { label: 'New', color: 'info' };
    return { label: 'Regular', color: 'default' };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Customers</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search customers by name, email, or customer ID..."
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
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredCustomers.length} of {customers.length} customers
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
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Total Spent</TableCell>
                <TableCell>Segment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const segment = getCustomerSegment(customer);
                return (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(customer.firstName, customer.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {customer.customerId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          {customer.email}
                        </Typography>
                        {customer.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            {customer.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.city}, {customer.state}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {customer.country}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {customer.ordersCount}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        orders
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${customer.totalSpent.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={segment.label}
                        color={segment.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewCustomer(customer)}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(selectedCustomer.firstName, selectedCustomer.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedCustomer.customerId}
                  </Typography>
                </Box>
                <Chip
                  label={getCustomerSegment(selectedCustomer).label}
                  color={getCustomerSegment(selectedCustomer).color}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Contact Information
                      </Typography>
                      <Typography sx={{ mb: 1 }}><strong>Email:</strong> {selectedCustomer.email}</Typography>
                      {selectedCustomer.phone && (
                        <Typography sx={{ mb: 1 }}><strong>Phone:</strong> {selectedCustomer.phone}</Typography>
                      )}
                      <Typography><strong>Address:</strong></Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedCustomer.address}<br />
                        {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.postalCode}<br />
                        {selectedCustomer.country}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Customer Statistics */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Customer Statistics
                      </Typography>
                      <Typography sx={{ mb: 1 }}><strong>Total Orders:</strong> {selectedCustomer.ordersCount}</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Total Spent:</strong> ${selectedCustomer.totalSpent.toFixed(2)}</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Average Order:</strong> ${(selectedCustomer.totalSpent / selectedCustomer.ordersCount).toFixed(2)}</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Customer Since:</strong> {format(selectedCustomer.createdAt, 'MMM dd, yyyy')}</Typography>
                      <Typography><strong>Last Order:</strong> {format(selectedCustomer.lastOrderDate, 'MMM dd, yyyy')}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order History */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <ShoppingBagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Recent Order History
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedCustomer.orders.map((order, index) => (
                            <TableRow key={index}>
                              <TableCell>{order.orderId}</TableCell>
                              <TableCell>{format(order.date, 'MMM dd, yyyy')}</TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={order.status}
                                  color={order.status === 'DELIVERED' ? 'success' : 
                                         order.status === 'PROCESSING' ? 'primary' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
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

export default Customers;

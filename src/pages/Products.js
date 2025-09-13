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
  Avatar,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  Category as CategoryIcon,
  TrendingUp as SalesIcon,
  Warning as WarningIcon,
  CheckCircle as InStockIcon,
} from '@mui/icons-material';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Try to load from API (will fall back to mock data if API unavailable)
      const mockProducts = [
        {
          id: 1,
          productId: 'PROD-001',
          name: 'AirPods Pro (3rd Gen)',
          description: 'Premium wireless earbuds with active noise cancellation',
          category: 'Electronics',
          price: 249.99,
          costPrice: 199.99,
          sku: 'APD-PRO-3G',
          inventoryQuantity: 150,
          lowStockThreshold: 20,
          totalSales: 89,
          totalRevenue: 22249.11,
          isActive: true,
          createdAt: new Date('2024-01-01T10:00:00')
        },
        {
          id: 2,
          productId: 'PROD-002',
          name: 'iPhone 15 Pro Max Case',
          description: 'Protective case for iPhone 15 Pro Max',
          category: 'Accessories',
          price: 45.99,
          costPrice: 20.00,
          sku: 'IPH-CASE-15PM',
          inventoryQuantity: 8,
          lowStockThreshold: 10,
          totalSales: 156,
          totalRevenue: 7174.44,
          isActive: true,
          createdAt: new Date('2024-01-05T14:30:00')
        },
        {
          id: 3,
          productId: 'PROD-003',
          name: 'MacBook Pro M3 Stand',
          description: 'Aluminum stand for MacBook Pro',
          category: 'Accessories',
          price: 89.99,
          costPrice: 45.00,
          sku: 'MBP-STAND-M3',
          inventoryQuantity: 45,
          lowStockThreshold: 10,
          totalSales: 32,
          totalRevenue: 2879.68,
          isActive: true,
          createdAt: new Date('2024-01-10T09:15:00')
        },
        {
          id: 4,
          productId: 'PROD-004',
          name: 'Smart Fitness Tracker',
          description: 'Advanced fitness tracking with heart rate monitor',
          category: 'Electronics',
          price: 199.99,
          costPrice: 120.00,
          inventoryQuantity: 3,
          lowStockThreshold: 15,
          totalSales: 67,
          totalRevenue: 13399.33,
          isActive: true,
          createdAt: new Date('2024-01-15T16:45:00')
        },
        {
          id: 5,
          productId: 'PROD-005',
          name: 'Premium Yoga Mat',
          description: 'Non-slip yoga mat with carrying strap',
          category: 'Fitness',
          price: 67.99,
          costPrice: 30.00,
          sku: 'YOGA-MAT-PREM',
          inventoryQuantity: 85,
          lowStockThreshold: 20,
          totalSales: 43,
          totalRevenue: 2923.57,
          isActive: true,
          createdAt: new Date('2024-01-20T11:20:00')
        }
      ];

      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(mockProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const getStockStatus = (product) => {
    if (product.inventoryQuantity <= 0) {
      return { label: 'Out of Stock', color: 'error', icon: <WarningIcon /> };
    } else if (product.inventoryQuantity <= product.lowStockThreshold) {
      return { label: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    } else {
      return { label: 'In Stock', color: 'success', icon: <InStockIcon /> };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Products</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{products.length}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Products</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {products.filter(p => p.inventoryQuantity <= p.lowStockThreshold).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Low Stock Items</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SalesIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {products.reduce((sum, p) => sum + (p.totalSales || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Sales</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PriceIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0))}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Revenue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name, SKU, or category..."
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
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Filter by Category"
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredProducts.length} of {products.length} products
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {products.filter(p => p.inventoryQuantity <= p.lowStockThreshold).length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{products.filter(p => p.inventoryQuantity <= p.lowStockThreshold).length} products</strong> are running low on stock!
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Sales</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <InventoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SKU: {product.sku || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(product.price)}
                      </Typography>
                      {product.costPrice && (
                        <Typography variant="caption" color="textSecondary">
                          Cost: {formatCurrency(product.costPrice)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.inventoryQuantity} units
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Low threshold: {product.lowStockThreshold}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {product.totalSales || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        units sold
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(product.totalRevenue || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                        icon={stockStatus.icon}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewProduct(product)}
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

      {/* Product Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedProduct.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedProduct.productId} • SKU: {selectedProduct.sku || 'N/A'}
                  </Typography>
                </Box>
                <Chip
                  label={getStockStatus(selectedProduct).label}
                  color={getStockStatus(selectedProduct).color}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Product Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Product Information
                      </Typography>
                      <Typography sx={{ mb: 1 }}><strong>Description:</strong></Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {selectedProduct.description}
                      </Typography>
                      <Typography sx={{ mb: 1 }}><strong>Category:</strong> {selectedProduct.category}</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Price:</strong> {formatCurrency(selectedProduct.price)}</Typography>
                      {selectedProduct.costPrice && (
                        <Typography sx={{ mb: 1 }}><strong>Cost Price:</strong> {formatCurrency(selectedProduct.costPrice)}</Typography>
                      )}
                      <Typography><strong>Created:</strong> {selectedProduct.createdAt?.toLocaleDateString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Inventory & Sales */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <SalesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Inventory & Sales
                      </Typography>
                      <Typography sx={{ mb: 1 }}><strong>Current Stock:</strong> {selectedProduct.inventoryQuantity} units</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Low Stock Alert:</strong> {selectedProduct.lowStockThreshold} units</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Total Sales:</strong> {selectedProduct.totalSales || 0} units</Typography>
                      <Typography sx={{ mb: 1 }}><strong>Total Revenue:</strong> {formatCurrency(selectedProduct.totalRevenue || 0)}</Typography>
                      <Typography><strong>Status:</strong> {selectedProduct.isActive ? 'Active' : 'Inactive'}</Typography>
                      
                      {selectedProduct.costPrice && selectedProduct.totalSales && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Profit Margin:</strong> {formatCurrency((selectedProduct.price - selectedProduct.costPrice) * selectedProduct.totalSales)}
                          </Typography>
                        </Box>
                      )}
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

export default Products;

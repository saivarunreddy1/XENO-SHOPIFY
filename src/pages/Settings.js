import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Chip,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Store as StoreIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Webhook as WebhookIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const Settings = () => {
  const { user } = useAuth();
  const { currentTenant, tenantData } = useTenant();
  const [settings, setSettings] = useState({
    storeName: tenantData?.storeName || 'Demo Store',
    storeUrl: tenantData?.storeUrl || 'https://demo-store.myshopify.com',
    apiKey: '**********************',
    webhookUrl: 'https://api.xenoapp.com/webhooks/shopify',
    emailNotifications: true,
    pushNotifications: false,
    orderAlerts: true,
    inventoryAlerts: true,
    customerAlerts: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    syncFrequency: '5',
    autoSync: true
  });
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      topic: 'orders/create',
      endpoint: 'https://api.xenoapp.com/webhooks/orders',
      status: 'active',
      lastTriggered: new Date('2024-01-16T14:20:00')
    },
    {
      id: 2,
      topic: 'orders/updated',
      endpoint: 'https://api.xenoapp.com/webhooks/orders/update',
      status: 'active',
      lastTriggered: new Date('2024-01-16T13:15:00')
    },
    {
      id: 3,
      topic: 'customers/create',
      endpoint: 'https://api.xenoapp.com/webhooks/customers',
      status: 'inactive',
      lastTriggered: null
    }
  ]);
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'xeno_prod_**********************',
      created: new Date('2023-12-01T10:00:00'),
      lastUsed: new Date('2024-01-16T14:20:00')
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'xeno_dev_**********************',
      created: new Date('2024-01-10T15:30:00'),
      lastUsed: new Date('2024-01-15T09:45:00')
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Simulate API call to save settings
    setTimeout(() => {
      setUnsavedChanges(false);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleTestWebhook = (webhookId) => {
    setSnackbar({
      open: true,
      message: 'Webhook test initiated...',
      severity: 'info'
    });
  };

  const handleSyncNow = () => {
    setSnackbar({
      open: true,
      message: 'Manual sync started...',
      severity: 'info'
    });
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: 'New API Key',
      key: 'xeno_' + Math.random().toString(36).substring(2, 15) + '_**********************',
      created: new Date(),
      lastUsed: null
    };
    setApiKeys(prev => [...prev, newKey]);
    setOpenDialog(false);
    setSnackbar({
      open: true,
      message: 'New API key generated successfully!',
      severity: 'success'
    });
  };

  const handleDeleteApiKey = (keyId) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    setSnackbar({
      open: true,
      message: 'API key deleted successfully!',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Store Configuration */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              avatar={<StoreIcon />}
              title="Store Configuration"
              subheader="Configure your Shopify store connection"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Name"
                    value={settings.storeName}
                    onChange={(e) => handleSettingChange('storeName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store URL"
                    value={settings.storeUrl}
                    onChange={(e) => handleSettingChange('storeUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Shopify API Key"
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                    helperText="Your Shopify private app API key"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook Endpoint"
                    value={settings.webhookUrl}
                    onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                    helperText="URL where Shopify webhooks will be sent"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon />}
              title="Notifications"
              subheader="Manage your notification preferences"
            />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.orderAlerts}
                      onChange={(e) => handleSettingChange('orderAlerts', e.target.checked)}
                    />
                  }
                  label="Order Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.inventoryAlerts}
                      onChange={(e) => handleSettingChange('inventoryAlerts', e.target.checked)}
                    />
                  }
                  label="Inventory Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.customerAlerts}
                      onChange={(e) => handleSettingChange('customerAlerts', e.target.checked)}
                    />
                  }
                  label="Customer Alerts"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Sync Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<SyncIcon />}
              title="Data Synchronization"
              subheader="Configure how often data is synced from Shopify"
              action={
                <Button
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncNow}
                >
                  Sync Now
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSync}
                        onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                      />
                    }
                    label="Enable Auto Sync"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Sync Frequency"
                    value={settings.syncFrequency}
                    onChange={(e) => handleSettingChange('syncFrequency', e.target.value)}
                    SelectProps={{ native: true }}
                    disabled={!settings.autoSync}
                  >
                    <option value="1">Every minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="info">
                    Last sync: {new Date().toLocaleString()}
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Webhooks Management */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<WebhookIcon />}
              title="Webhooks"
              subheader="Manage Shopify webhook subscriptions"
            />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Topic</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Triggered</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>{webhook.topic}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {webhook.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={webhook.status}
                            color={webhook.status === 'active' ? 'success' : 'default'}
                            size="small"
                            icon={webhook.status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          {webhook.lastTriggered 
                            ? new Date(webhook.lastTriggered).toLocaleString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleTestWebhook(webhook.id)}
                          >
                            Test
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* API Keys Management */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<KeyIcon />}
              title="API Keys"
              subheader="Manage your API keys for external integrations"
              action={
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Generate New Key
                </Button>
              }
            />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Used</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {key.key}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(key.created).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {key.lastUsed 
                            ? new Date(key.lastUsed).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            {unsavedChanges && (
              <Alert severity="warning">You have unsaved changes</Alert>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={!unsavedChanges}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Generate API Key Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will generate a new API key for external integrations. Keep it secure!
          </Typography>
          <TextField
            fullWidth
            label="Key Name"
            placeholder="Enter a name for this API key"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateApiKey} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

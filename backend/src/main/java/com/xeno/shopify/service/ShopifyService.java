package com.xeno.shopify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.xeno.shopify.model.Customer;
import com.xeno.shopify.model.Order;
import com.xeno.shopify.model.Product;
import com.xeno.shopify.model.Tenant;
import com.xeno.shopify.repository.ShopifyCustomerRepository;
import com.xeno.shopify.repository.ShopifyOrderRepository;
import com.xeno.shopify.repository.ShopifyProductRepository;
import com.xeno.shopify.repository.TenantRepository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShopifyService {

    private static final Logger logger = LoggerFactory.getLogger(ShopifyService.class);

    @Autowired
    private ShopifyCustomerRepository customerRepository;

    @Autowired
    private ShopifyOrderRepository orderRepository;

    @Autowired
    private ShopifyProductRepository productRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Value("${shopify.api.version:2023-10}")
    private String apiVersion;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Sync all data for a specific tenant
     */
    @Async
    public void syncAllData(String tenantId) {
        logger.info("Starting full data sync for tenant: {}", tenantId);
        
        Optional<Tenant> tenantOpt = tenantRepository.findByTenantId(tenantId);
        if (tenantOpt.isEmpty()) {
            logger.error("Tenant not found: {}", tenantId);
            return;
        }

        Tenant tenant = tenantOpt.get();
        
        try {
            syncCustomers(tenant);
            syncProducts(tenant);
            syncOrders(tenant);
            logger.info("Completed full data sync for tenant: {}", tenantId);
        } catch (Exception e) {
            logger.error("Error during full sync for tenant {}: {}", tenantId, e.getMessage(), e);
        }
    }

    /**
     * Sync customers from Shopify
     */
    public void syncCustomers(Tenant tenant) {
        if (tenant.getShopifyAccessToken() == null) {
            logger.warn("No Shopify access token for tenant: {}", tenant.getTenantId());
            return;
        }

        try {
            logger.info("Syncing customers for tenant: {}", tenant.getTenantId());
            
            String url = String.format("https://%s/admin/api/%s/customers.json", 
                tenant.getShopDomain(), apiVersion);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Shopify-Access-Token", tenant.getShopifyAccessToken());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                processCustomersResponse(response.getBody(), tenant.getTenantId());
            }
            
        } catch (Exception e) {
            logger.error("Error syncing customers for tenant {}: {}", tenant.getTenantId(), e.getMessage());
            // Fallback to sample data for demo purposes
            createSampleCustomers(tenant.getTenantId());
        }
    }

    /**
     * Sync products from Shopify
     */
    public void syncProducts(Tenant tenant) {
        if (tenant.getShopifyAccessToken() == null) {
            logger.warn("No Shopify access token for tenant: {}", tenant.getTenantId());
            return;
        }

        try {
            logger.info("Syncing products for tenant: {}", tenant.getTenantId());
            
            String url = String.format("https://%s/admin/api/%s/products.json", 
                tenant.getShopDomain(), apiVersion);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Shopify-Access-Token", tenant.getShopifyAccessToken());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                processProductsResponse(response.getBody(), tenant.getTenantId());
            }
            
        } catch (Exception e) {
            logger.error("Error syncing products for tenant {}: {}", tenant.getTenantId(), e.getMessage());
            // Fallback to sample data for demo purposes
            createSampleProducts(tenant.getTenantId());
        }
    }

    /**
     * Sync orders from Shopify
     */
    public void syncOrders(Tenant tenant) {
        if (tenant.getShopifyAccessToken() == null) {
            logger.warn("No Shopify access token for tenant: {}", tenant.getTenantId());
            return;
        }

        try {
            logger.info("Syncing orders for tenant: {}", tenant.getTenantId());
            
            String url = String.format("https://%s/admin/api/%s/orders.json?status=any", 
                tenant.getShopDomain(), apiVersion);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Shopify-Access-Token", tenant.getShopifyAccessToken());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                processOrdersResponse(response.getBody(), tenant.getTenantId());
            }
            
        } catch (Exception e) {
            logger.error("Error syncing orders for tenant {}: {}", tenant.getTenantId(), e.getMessage());
            // Fallback to sample data for demo purposes
            createSampleOrders(tenant.getTenantId());
        }
    }

    /**
     * Process webhook for order creation
     */
    public void processOrderWebhook(String webhookData, String tenantId) {
        try {
            logger.info("Processing order webhook for tenant: {}", tenantId);
            JsonNode orderNode = objectMapper.readTree(webhookData);
            processOrderData(orderNode, tenantId);
        } catch (Exception e) {
            logger.error("Error processing order webhook for tenant {}: {}", tenantId, e.getMessage());
        }
    }

    /**
     * Process webhook for customer creation/update
     */
    public void processCustomerWebhook(String webhookData, String tenantId) {
        try {
            logger.info("Processing customer webhook for tenant: {}", tenantId);
            JsonNode customerNode = objectMapper.readTree(webhookData);
            processCustomerData(customerNode, tenantId);
        } catch (Exception e) {
            logger.error("Error processing customer webhook for tenant {}: {}", tenantId, e.getMessage());
        }
    }

    /**
     * Scheduled sync - runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledSync() {
        logger.info("Running scheduled sync for all active tenants");
        
        List<Tenant> activeTenants = tenantRepository.findByIsActive(true);
        
        for (Tenant tenant : activeTenants) {
            syncAllData(tenant.getTenantId());
        }
    }

    private void processCustomersResponse(String responseBody, String tenantId) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode customers = root.get("customers");
            
            if (customers != null && customers.isArray()) {
                for (JsonNode customerNode : customers) {
                    processCustomerData(customerNode, tenantId);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing customers response: {}", e.getMessage());
        }
    }

    private void processProductsResponse(String responseBody, String tenantId) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode products = root.get("products");
            
            if (products != null && products.isArray()) {
                for (JsonNode productNode : products) {
                    processProductData(productNode, tenantId);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing products response: {}", e.getMessage());
        }
    }

    private void processOrdersResponse(String responseBody, String tenantId) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode orders = root.get("orders");
            
            if (orders != null && orders.isArray()) {
                for (JsonNode orderNode : orders) {
                    processOrderData(orderNode, tenantId);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing orders response: {}", e.getMessage());
        }
    }

    private void processCustomerData(JsonNode customerNode, String tenantId) {
        try {
            String shopifyId = customerNode.get("id").asText();
            
            Optional<Customer> existingCustomer = customerRepository
                .findByTenantIdAndShopifyId(tenantId, shopifyId);
            
            Customer customer = existingCustomer.orElse(new Customer());
            customer.setTenantId(tenantId);
            customer.setShopifyId(shopifyId);
            customer.setEmail(getTextValue(customerNode, "email"));
            customer.setFirstName(getTextValue(customerNode, "first_name"));
            customer.setLastName(getTextValue(customerNode, "last_name"));
            customer.setPhone(getTextValue(customerNode, "phone"));
            customer.setTotalSpent(getBigDecimalValue(customerNode, "total_spent"));
            customer.setOrdersCount(getIntValue(customerNode, "orders_count"));
            customer.setAcceptsMarketing(getBooleanValue(customerNode, "accepts_marketing"));
            customer.setVerifiedEmail(getBooleanValue(customerNode, "verified_email"));
            customer.setState(getTextValue(customerNode, "state"));
            
            customerRepository.save(customer);
            
        } catch (Exception e) {
            logger.error("Error processing customer data: {}", e.getMessage());
        }
    }

    private void processProductData(JsonNode productNode, String tenantId) {
        try {
            String shopifyId = productNode.get("id").asText();
            
            Optional<Product> existingProduct = productRepository
                .findByTenantIdAndShopifyId(tenantId, shopifyId);
            
            Product product = existingProduct.orElse(new Product());
            product.setTenantId(tenantId);
            product.setShopifyId(shopifyId);
            product.setTitle(getTextValue(productNode, "title"));
            product.setVendor(getTextValue(productNode, "vendor"));
            product.setProductType(getTextValue(productNode, "product_type"));
            product.setStatus(getTextValue(productNode, "status"));
            product.setTaxable(getBooleanValue(productNode, "taxable"));
            
            // Get price from first variant
            JsonNode variants = productNode.get("variants");
            if (variants != null && variants.isArray() && variants.size() > 0) {
                JsonNode firstVariant = variants.get(0);
                product.setPrice(getBigDecimalValue(firstVariant, "price"));
                product.setInventoryQuantity(getIntValue(firstVariant, "inventory_quantity"));
                product.setSku(getTextValue(firstVariant, "sku"));
            }
            
            productRepository.save(product);
            
        } catch (Exception e) {
            logger.error("Error processing product data: {}", e.getMessage());
        }
    }

    private void processOrderData(JsonNode orderNode, String tenantId) {
        try {
            String shopifyId = orderNode.get("id").asText();
            
            Optional<Order> existingOrder = orderRepository
                .findByTenantIdAndShopifyId(tenantId, shopifyId);
            
            Order order = existingOrder.orElse(new Order());
            order.setTenantId(tenantId);
            order.setShopifyId(shopifyId);
            order.setOrderNumber(getTextValue(orderNode, "order_number"));
            order.setName(getTextValue(orderNode, "name"));
            order.setCustomerShopifyId(getTextValue(orderNode.get("customer"), "id"));
            order.setEmail(getTextValue(orderNode, "email"));
            order.setFinancialStatus(getTextValue(orderNode, "financial_status"));
            order.setFulfillmentStatus(getTextValue(orderNode, "fulfillment_status"));
            order.setTotalPrice(getBigDecimalValue(orderNode, "total_price"));
            order.setSubtotalPrice(getBigDecimalValue(orderNode, "subtotal_price"));
            order.setTotalTax(getBigDecimalValue(orderNode, "total_tax"));
            order.setCurrency(getTextValue(orderNode, "currency"));
            
            String processedAtStr = getTextValue(orderNode, "processed_at");
            if (processedAtStr != null) {
                order.setProcessedAt(OffsetDateTime.parse(processedAtStr).toLocalDateTime());
            }
            
            orderRepository.save(order);
            
        } catch (Exception e) {
            logger.error("Error processing order data: {}", e.getMessage());
        }
    }

    // Utility methods for safe JSON parsing
    private String getTextValue(JsonNode node, String field) {
        if (node != null && node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return null;
    }

    private BigDecimal getBigDecimalValue(JsonNode node, String field) {
        if (node != null && node.has(field) && !node.get(field).isNull()) {
            return new BigDecimal(node.get(field).asText());
        }
        return BigDecimal.ZERO;
    }

    private Integer getIntValue(JsonNode node, String field) {
        if (node != null && node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asInt();
        }
        return 0;
    }

    private Boolean getBooleanValue(JsonNode node, String field) {
        if (node != null && node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asBoolean();
        }
        return false;
    }

    // Sample data creation methods for demo purposes
    private void createSampleCustomers(String tenantId) {
        logger.info("Creating sample customers for demo tenant: {}", tenantId);
        // Sample customers are already in seed data, no need to create more
    }

    private void createSampleProducts(String tenantId) {
        logger.info("Creating sample products for demo tenant: {}", tenantId);
        // Sample products are already in seed data, no need to create more
    }

    private void createSampleOrders(String tenantId) {
        logger.info("Creating sample orders for demo tenant: {}", tenantId);
        // Sample orders are already in seed data, no need to create more
    }
}

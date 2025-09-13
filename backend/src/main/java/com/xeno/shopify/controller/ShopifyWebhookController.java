package com.xeno.shopify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.xeno.shopify.service.ShopifyService;

import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;

@RestController
@RequestMapping("/shopify/webhooks")
@CrossOrigin(origins = "*")
public class ShopifyWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(ShopifyWebhookController.class);

    @Autowired
    private ShopifyService shopifyService;

    /**
     * Handle order creation webhook
     */
    @PostMapping("/orders/create")
    public ResponseEntity<String> handleOrderCreated(
            HttpServletRequest request,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain,
            @RequestHeader(value = "X-Shopify-Webhook-Id", required = false) String webhookId,
            @RequestBody String requestBody) {
        
        try {
            logger.info("Received order creation webhook from shop: {}, webhook ID: {}", shopDomain, webhookId);
            
            // Extract tenant ID from shop domain
            String tenantId = extractTenantIdFromShopDomain(shopDomain);
            if (tenantId == null) {
                logger.warn("Could not determine tenant from shop domain: {}", shopDomain);
                return ResponseEntity.badRequest().body("Invalid shop domain");
            }
            
            // Process the webhook
            shopifyService.processOrderWebhook(requestBody, tenantId);
            
            logger.info("Successfully processed order creation webhook for tenant: {}", tenantId);
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Error processing order creation webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }

    /**
     * Handle order payment webhook
     */
    @PostMapping("/orders/paid")
    public ResponseEntity<String> handleOrderPaid(
            HttpServletRequest request,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain,
            @RequestHeader(value = "X-Shopify-Webhook-Id", required = false) String webhookId,
            @RequestBody String requestBody) {
        
        try {
            logger.info("Received order payment webhook from shop: {}, webhook ID: {}", shopDomain, webhookId);
            
            String tenantId = extractTenantIdFromShopDomain(shopDomain);
            if (tenantId == null) {
                return ResponseEntity.badRequest().body("Invalid shop domain");
            }
            
            shopifyService.processOrderWebhook(requestBody, tenantId);
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Error processing order payment webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }

    /**
     * Handle customer creation webhook
     */
    @PostMapping("/customers/create")
    public ResponseEntity<String> handleCustomerCreated(
            HttpServletRequest request,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain,
            @RequestHeader(value = "X-Shopify-Webhook-Id", required = false) String webhookId,
            @RequestBody String requestBody) {
        
        try {
            logger.info("Received customer creation webhook from shop: {}, webhook ID: {}", shopDomain, webhookId);
            
            String tenantId = extractTenantIdFromShopDomain(shopDomain);
            if (tenantId == null) {
                return ResponseEntity.badRequest().body("Invalid shop domain");
            }
            
            shopifyService.processCustomerWebhook(requestBody, tenantId);
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Error processing customer creation webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }

    /**
     * Handle customer update webhook
     */
    @PostMapping("/customers/update")
    public ResponseEntity<String> handleCustomerUpdated(
            HttpServletRequest request,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain,
            @RequestHeader(value = "X-Shopify-Webhook-Id", required = false) String webhookId,
            @RequestBody String requestBody) {
        
        try {
            logger.info("Received customer update webhook from shop: {}, webhook ID: {}", shopDomain, webhookId);
            
            String tenantId = extractTenantIdFromShopDomain(shopDomain);
            if (tenantId == null) {
                return ResponseEntity.badRequest().body("Invalid shop domain");
            }
            
            shopifyService.processCustomerWebhook(requestBody, tenantId);
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Error processing customer update webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }

    /**
     * Handle product creation webhook
     */
    @PostMapping("/products/create")
    public ResponseEntity<String> handleProductCreated(
            HttpServletRequest request,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain,
            @RequestHeader(value = "X-Shopify-Webhook-Id", required = false) String webhookId,
            @RequestBody String requestBody) {
        
        try {
            logger.info("Received product creation webhook from shop: {}, webhook ID: {}", shopDomain, webhookId);
            
            String tenantId = extractTenantIdFromShopDomain(shopDomain);
            if (tenantId == null) {
                return ResponseEntity.badRequest().body("Invalid shop domain");
            }
            
            // For now, we'll just log this. You could extend ShopifyService to handle product webhooks
            logger.info("Product webhook received for tenant: {} - implement processing as needed", tenantId);
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            logger.error("Error processing product creation webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }

    /**
     * Manual sync endpoint for triggering data sync
     */
    @PostMapping("/sync/{tenantId}")
    public ResponseEntity<String> triggerSync(@PathVariable String tenantId) {
        try {
            logger.info("Manual sync triggered for tenant: {}", tenantId);
            shopifyService.syncAllData(tenantId);
            return ResponseEntity.ok("Sync initiated for tenant: " + tenantId);
        } catch (Exception e) {
            logger.error("Error triggering sync for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error triggering sync");
        }
    }

    /**
     * Health check endpoint for Shopify webhook verification
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Shopify webhooks are healthy");
    }

    /**
     * Extract tenant ID from Shopify shop domain
     * This is a simple implementation - in production you might want to store the mapping in database
     */
    private String extractTenantIdFromShopDomain(String shopDomain) {
        if (shopDomain == null) {
            return null;
        }
        
        // Map shop domains to tenant IDs
        // In production, this would be stored in database
        if (shopDomain.contains("demo-fashion")) {
            return "demo-store-1";
        } else if (shopDomain.contains("demo-electronics")) {
            return "demo-store-2";
        } else if (shopDomain.contains("demo-books")) {
            return "demo-store-3";
        }
        
        // For other domains, try to extract tenant ID or return null
        logger.warn("Unknown shop domain: {}", shopDomain);
        return null;
    }

    /**
     * Verify Shopify webhook signature (basic implementation)
     * In production, you should verify the webhook signature using HMAC
     */
    private boolean verifyWebhookSignature(String signature, String requestBody, String webhookSecret) {
        // TODO: Implement HMAC SHA256 signature verification
        // For now, just return true for demo purposes
        return true;
    }
}

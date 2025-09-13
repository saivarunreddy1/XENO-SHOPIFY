package com.xeno.shopify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.xeno.shopify.dto.DashboardMetrics;
import com.xeno.shopify.dto.CustomerAnalytics;
import com.xeno.shopify.dto.OrderTrends;
import com.xeno.shopify.service.AnalyticsService;
import com.xeno.shopify.service.JwtService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardMetrics(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String tenantId = jwtService.extractTenantId(jwt);
            
            DashboardMetrics metrics = analyticsService.getDashboardMetrics(tenantId);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get dashboard metrics: " + e.getMessage());
        }
    }

    @GetMapping("/customers/top")
    public ResponseEntity<?> getTopCustomers(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            String jwt = token.substring(7);
            String tenantId = jwtService.extractTenantId(jwt);
            
            List<CustomerAnalytics> topCustomers = analyticsService.getTopCustomers(tenantId, limit);
            return ResponseEntity.ok(topCustomers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get top customers: " + e.getMessage());
        }
    }

    @GetMapping("/orders/trends")
    public ResponseEntity<?> getOrderTrends(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "30") int days) {
        try {
            String jwt = token.substring(7);
            String tenantId = jwtService.extractTenantId(jwt);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(days);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            List<OrderTrends> trends = analyticsService.getOrderTrends(tenantId, start, end);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get order trends: " + e.getMessage());
        }
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<?> getMonthlyRevenue(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String tenantId = jwtService.extractTenantId(jwt);
            
            Map<String, Double> monthlyRevenue = analyticsService.getMonthlyRevenue(tenantId);
            return ResponseEntity.ok(monthlyRevenue);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get monthly revenue: " + e.getMessage());
        }
    }

    @GetMapping("/orders/status")
    public ResponseEntity<?> getOrdersByStatus(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String tenantId = jwtService.extractTenantId(jwt);
            
            Map<String, Long> ordersByStatus = analyticsService.getOrdersByStatus(tenantId);
            return ResponseEntity.ok(ordersByStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get orders by status: " + e.getMessage());
        }
    }

    @GetMapping("/products/top")
    public ResponseEntity<?> getTopProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String jwt = token.substring(7);
            String tenantId = jwtService.extractTenantId(jwt);
            
            List<Map<String, Object>> topProducts = analyticsService.getTopProducts(tenantId, limit);
            return ResponseEntity.ok(topProducts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get top products: " + e.getMessage());
        }
    }
}

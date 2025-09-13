package com.xeno.assignment.controller;

import com.xeno.assignment.entity.Order;
import com.xeno.assignment.service.OrderService;
import com.xeno.assignment.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getTenantId(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromRequest(request);
        if (token != null) {
            return jwtUtil.getTenantIdFromToken(token);
        }
        return "demo-tenant"; // Default for now
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            HttpServletRequest request,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String tenantId = getTenantId(request);
        
        if (customerId != null) {
            List<Order> orders = orderService.getOrdersByCustomer(tenantId, customerId);
            return ResponseEntity.ok(orders);
        }
        
        if (status != null && !status.isEmpty()) {
            List<Order> orders = orderService.getOrdersByStatus(tenantId, status);
            return ResponseEntity.ok(orders);
        }
        
        if (startDate != null && endDate != null) {
            List<Order> orders = orderService.getOrdersByDateRange(tenantId, startDate, endDate);
            return ResponseEntity.ok(orders);
        }
        
        if (page != null && size != null) {
            Page<Order> ordersPage = orderService.getAllOrders(tenantId, page, size);
            return ResponseEntity.ok(ordersPage.getContent());
        }
        
        List<Order> orders = orderService.getAllOrders(tenantId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        Optional<Order> order = orderService.getOrderById(tenantId, id);
        
        return order.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order-id/{orderId}")
    public ResponseEntity<Order> getOrderByOrderId(
            HttpServletRequest request,
            @PathVariable String orderId) {
        
        String tenantId = getTenantId(request);
        Optional<Order> order = orderService.getOrderByOrderId(tenantId, orderId);
        
        return order.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            HttpServletRequest request,
            @RequestBody Order order) {
        
        String tenantId = getTenantId(request);
        Order createdOrder = orderService.createOrder(tenantId, order);
        return ResponseEntity.ok(createdOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Order orderDetails) {
        
        String tenantId = getTenantId(request);
        Order updatedOrder = orderService.updateOrder(tenantId, id, orderDetails);
        
        return updatedOrder != null ? 
                ResponseEntity.ok(updatedOrder) : 
                ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        boolean deleted = orderService.deleteOrder(tenantId, id);
        
        return deleted ? 
                ResponseEntity.ok().build() : 
                ResponseEntity.notFound().build();
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Order>> getRecentOrders(
            HttpServletRequest request,
            @RequestParam(defaultValue = "10") int limit) {
        
        String tenantId = getTenantId(request);
        List<Order> recentOrders = orderService.getRecentOrders(tenantId, limit);
        return ResponseEntity.ok(recentOrders);
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderStats> getOrderStats(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String tenantId = getTenantId(request);
        
        OrderStats stats = new OrderStats();
        stats.totalOrders = orderService.getOrderCount(tenantId);
        stats.totalRevenue = orderService.getTotalRevenue(tenantId);
        stats.statusCounts = orderService.getOrderStatusCounts(tenantId);
        stats.recentOrders = orderService.getRecentOrders(tenantId, 5);
        
        if (startDate != null && endDate != null) {
            stats.periodOrders = orderService.getOrderCountByDateRange(tenantId, startDate, endDate);
            stats.periodRevenue = orderService.getTotalRevenueByDateRange(tenantId, startDate, endDate);
            stats.dailyAnalytics = orderService.getDailyOrdersAnalytics(tenantId, startDate, endDate);
        }
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/daily")
    public ResponseEntity<List<Object[]>> getDailyAnalytics(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String tenantId = getTenantId(request);
        List<Object[]> analytics = orderService.getDailyOrdersAnalytics(tenantId, startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // Order lifecycle endpoints
    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<Order> confirmOrder(
            HttpServletRequest request,
            @PathVariable String orderId) {
        
        String tenantId = getTenantId(request);
        Order confirmedOrder = orderService.confirmOrder(tenantId, orderId);
        
        return confirmedOrder != null ?
                ResponseEntity.ok(confirmedOrder) :
                ResponseEntity.notFound().build();
    }

    @PostMapping("/{orderId}/ship")
    public ResponseEntity<Order> shipOrder(
            HttpServletRequest request,
            @PathVariable String orderId,
            @RequestParam String trackingNumber) {
        
        String tenantId = getTenantId(request);
        Order shippedOrder = orderService.shipOrder(tenantId, orderId, trackingNumber);
        
        return shippedOrder != null ?
                ResponseEntity.ok(shippedOrder) :
                ResponseEntity.notFound().build();
    }

    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<Order> deliverOrder(
            HttpServletRequest request,
            @PathVariable String orderId) {
        
        String tenantId = getTenantId(request);
        Order deliveredOrder = orderService.deliverOrder(tenantId, orderId);
        
        return deliveredOrder != null ?
                ResponseEntity.ok(deliveredOrder) :
                ResponseEntity.notFound().build();
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            HttpServletRequest request,
            @PathVariable String orderId,
            @RequestParam String reason) {
        
        String tenantId = getTenantId(request);
        Order cancelledOrder = orderService.cancelOrder(tenantId, orderId, reason);
        
        return cancelledOrder != null ?
                ResponseEntity.ok(cancelledOrder) :
                ResponseEntity.notFound().build();
    }

    // Inner class for order statistics
    public static class OrderStats {
        public Long totalOrders;
        public Double totalRevenue;
        public Map<String, Long> statusCounts;
        public List<Order> recentOrders;
        public Long periodOrders;
        public Double periodRevenue;
        public List<Object[]> dailyAnalytics;
    }
}

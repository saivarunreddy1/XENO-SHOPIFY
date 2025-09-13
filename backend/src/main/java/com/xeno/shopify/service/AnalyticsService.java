package com.xeno.shopify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.xeno.shopify.dto.DashboardMetrics;
import com.xeno.shopify.dto.CustomerAnalytics;
import com.xeno.shopify.dto.OrderTrends;
import com.xeno.assignment.service.CustomerService;
import com.xeno.assignment.service.OrderService;
import com.xeno.assignment.service.ProductService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;

    public DashboardMetrics getDashboardMetrics(String tenantId) {
        DashboardMetrics metrics = new DashboardMetrics();

        // Use new service methods
        metrics.setTotalCustomers(customerService.getCustomerCount(tenantId));
        metrics.setTotalOrders(orderService.getOrderCount(tenantId));
        metrics.setTotalRevenue(orderService.getTotalRevenue(tenantId));
        metrics.setTotalProducts(productService.getProductCount(tenantId));
        
        // Calculate average order value
        Long totalOrders = orderService.getOrderCount(tenantId);
        Double totalRevenue = orderService.getTotalRevenue(tenantId);
        if (totalOrders > 0) {
            metrics.setAverageOrderValue(totalRevenue / totalOrders);
        } else {
            metrics.setAverageOrderValue(0.0);
        }

        // Recent Orders (Last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();
        Long recentOrders = orderService.getOrderCountByDateRange(tenantId, sevenDaysAgo, now);
        metrics.setRecentOrders(recentOrders);

        // Growth metrics (month over month)
        LocalDateTime thisMonthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime thisMonthEnd = LocalDateTime.now();
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDateTime lastMonthEnd = thisMonthStart.minusSeconds(1);
        
        Long thisMonthOrders = orderService.getOrderCountByDateRange(tenantId, thisMonthStart, thisMonthEnd);
        Long lastMonthOrders = orderService.getOrderCountByDateRange(tenantId, lastMonthStart, lastMonthEnd);

        if (lastMonthOrders != null && lastMonthOrders > 0) {
            double growth = ((thisMonthOrders != null ? thisMonthOrders : 0L) - lastMonthOrders) * 100.0 / lastMonthOrders;
            metrics.setOrdersGrowthPercent(growth);
        } else {
            metrics.setOrdersGrowthPercent(0.0);
        }

        return metrics;
    }

    public List<CustomerAnalytics> getTopCustomers(String tenantId, int limit) {
        // Use new CustomerService
        var customers = customerService.getTopCustomersBySpending(tenantId, limit);
        
        List<CustomerAnalytics> analytics = new ArrayList<>();
        for (var customer : customers) {
            CustomerAnalytics ca = new CustomerAnalytics();
            ca.setId(customer.getId());
            ca.setEmail(customer.getEmail());
            ca.setFirstName(customer.getFirstName());
            ca.setLastName(customer.getLastName());
            ca.setTotalSpent(customer.getTotalSpent());
            ca.setOrdersCount(customer.getOrdersCount());
            analytics.add(ca);
        }
        
        return analytics;
    }

    public List<OrderTrends> getOrderTrends(String tenantId, LocalDate startDate, LocalDate endDate) {
        // Use new OrderService
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<Object[]> analytics = orderService.getDailyOrdersAnalytics(tenantId, startDateTime, endDateTime);
        
        List<OrderTrends> trends = new ArrayList<>();
        for (Object[] row : analytics) {
            OrderTrends trend = new OrderTrends();
            trend.setDate(((java.sql.Date) row[0]).toLocalDate());
            trend.setOrderCount((Long) row[1]);
            trend.setRevenue(((BigDecimal) row[2]).doubleValue());
            trends.add(trend);
        }
        
        return trends;
    }

    public Map<String, Double> getMonthlyRevenue(String tenantId) {
        String query = """
            SELECT 
                DATE_FORMAT(processed_at, '%Y-%m') as month,
                COALESCE(SUM(total_price), 0) as revenue
            FROM orders 
            WHERE tenant_id = ? 
                AND processed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                AND financial_status = 'paid'
            GROUP BY DATE_FORMAT(processed_at, '%Y-%m')
            ORDER BY month
        """;

        Map<String, Double> monthlyRevenue = new HashMap<>();
        jdbcTemplate.query(query, rs -> {
            monthlyRevenue.put(rs.getString("month"), rs.getBigDecimal("revenue").doubleValue());
        }, tenantId);

        return monthlyRevenue;
    }

    public Map<String, Long> getOrdersByStatus(String tenantId) {
        // Use new OrderService
        return orderService.getOrderStatusCounts(tenantId);
    }

    public List<Map<String, Object>> getTopProducts(String tenantId, int limit) {
        // Use new ProductService
        var products = productService.getTopRevenueProducts(tenantId, limit);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (var product : products) {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("title", product.getName());
            productMap.put("price", product.getPrice());
            productMap.put("inventoryQuantity", product.getInventoryQuantity());
            productMap.put("totalSold", product.getTotalSales());
            productMap.put("totalRevenue", product.getTotalRevenue());
            result.add(productMap);
        }
        
        return result;
    }
}

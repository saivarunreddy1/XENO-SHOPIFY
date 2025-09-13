package com.xeno.shopify.dto;

public class DashboardMetrics {
    
    private Long totalCustomers;
    private Long totalOrders;
    private Double totalRevenue;
    private Long totalProducts;
    private Double averageOrderValue;
    private Long recentOrders;
    private Double ordersGrowthPercent;
    
    public DashboardMetrics() {}
    
    public Long getTotalCustomers() {
        return totalCustomers;
    }
    
    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public Double getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Double getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(Double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public Long getRecentOrders() {
        return recentOrders;
    }
    
    public void setRecentOrders(Long recentOrders) {
        this.recentOrders = recentOrders;
    }
    
    public Double getOrdersGrowthPercent() {
        return ordersGrowthPercent;
    }
    
    public void setOrdersGrowthPercent(Double ordersGrowthPercent) {
        this.ordersGrowthPercent = ordersGrowthPercent;
    }
}

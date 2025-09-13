package com.xeno.shopify.dto;

import java.time.LocalDate;

public class OrderTrends {
    
    private LocalDate date;
    private Long orderCount;
    private Double revenue;
    
    public OrderTrends() {}
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Long getOrderCount() {
        return orderCount;
    }
    
    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }
    
    public Double getRevenue() {
        return revenue;
    }
    
    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }
}

package com.xeno.shopify.dto;

public class CustomerAnalytics {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Double totalSpent;
    private Integer ordersCount;
    
    public CustomerAnalytics() {}
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public Double getTotalSpent() {
        return totalSpent;
    }
    
    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }
    
    public Integer getOrdersCount() {
        return ordersCount;
    }
    
    public void setOrdersCount(Integer ordersCount) {
        this.ordersCount = ordersCount;
    }
}

package com.xeno.assignment.service;

import com.xeno.assignment.entity.Order;
import com.xeno.assignment.entity.OrderItem;
import com.xeno.assignment.entity.Customer;
import com.xeno.assignment.entity.OrderStatus;
import com.xeno.assignment.repository.OrderRepository;
import com.xeno.assignment.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    public List<Order> getAllOrders(String tenantId) {
        return orderRepository.findByTenantIdOrderByOrderDateDesc(tenantId);
    }

    public Page<Order> getAllOrders(String tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByTenantIdOrderByOrderDateDesc(tenantId, pageable);
    }

    public Optional<Order> getOrderById(String tenantId, Long id) {
        return orderRepository.findById(id)
                .filter(order -> order.getTenantId().equals(tenantId));
    }

    public Optional<Order> getOrderByOrderId(String tenantId, String orderId) {
        return orderRepository.findByTenantIdAndOrderId(tenantId, orderId);
    }

    public List<Order> getOrdersByCustomer(String tenantId, Long customerId) {
        return orderRepository.findByTenantIdAndCustomerIdOrderByOrderDateDesc(tenantId, customerId);
    }

    public List<Order> getOrdersByStatus(String tenantId, String status) {
        return orderRepository.findByTenantIdAndStatus(tenantId, status);
    }

    public List<Order> getOrdersByDateRange(String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByTenantIdAndOrderDateBetween(tenantId, startDate, endDate);
    }

    public Order createOrder(String tenantId, Order order) {
        // Generate order ID if not provided
        if (order.getOrderId() == null || order.getOrderId().isEmpty()) {
            order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        order.setTenantId(tenantId);
        Order savedOrder = orderRepository.save(order);
        
        // Update customer statistics
        if (order.getCustomer() != null) {
            customerService.updateCustomerStatistics(
                tenantId, 
                order.getCustomer().getCustomerId(), 
                order.getTotalAmount(), 
                true
            );
        }
        
        // Update product statistics if order items exist
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    productService.updateProductStatistics(
                        tenantId,
                        item.getProduct().getProductId(),
                        item.getQuantity(),
                        item.getTotalPrice(),
                        true
                    );
                }
            }
        }
        
        return savedOrder;
    }

    public Order updateOrder(String tenantId, Long id, Order orderDetails) {
        return orderRepository.findById(id)
                .filter(order -> order.getTenantId().equals(tenantId))
                .map(order -> {
                    order.setStatus(orderDetails.getStatus());
                    order.setSubtotal(orderDetails.getSubtotal());
                    order.setTaxAmount(orderDetails.getTaxAmount());
                    order.setShippingCost(orderDetails.getShippingCost());
                    order.setDiscountAmount(orderDetails.getDiscountAmount());
                    order.setTotalAmount(orderDetails.getTotalAmount());
                    order.setCurrency(orderDetails.getCurrency());
                    order.setPaymentMethod(orderDetails.getPaymentMethod());
                    order.setPaymentStatus(orderDetails.getPaymentStatus());
                    order.setShippingAddress(orderDetails.getShippingAddress());
                    order.setBillingAddress(orderDetails.getBillingAddress());
                    order.setTrackingNumber(orderDetails.getTrackingNumber());
                    order.setNotes(orderDetails.getNotes());
                    
                    if (orderDetails.getShippedDate() != null) {
                        order.setShippedDate(orderDetails.getShippedDate());
                    }
                    if (orderDetails.getDeliveredDate() != null) {
                        order.setDeliveredDate(orderDetails.getDeliveredDate());
                    }
                    
                    return orderRepository.save(order);
                })
                .orElse(null);
    }

    public boolean deleteOrder(String tenantId, Long id) {
        return orderRepository.findById(id)
                .filter(order -> order.getTenantId().equals(tenantId))
                .map(order -> {
                    orderRepository.delete(order);
                    return true;
                })
                .orElse(false);
    }

    public List<Order> getRecentOrders(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderRepository.findRecentOrders(tenantId, pageable);
    }

    // Analytics methods
    public Long getOrderCount(String tenantId) {
        return orderRepository.countByTenantId(tenantId);
    }

    public Double getTotalRevenue(String tenantId) {
        Double revenue = orderRepository.getTotalRevenueByTenantId(tenantId);
        return revenue != null ? revenue : 0.0;
    }

    public Long getOrderCountByStatus(String tenantId, String status) {
        return orderRepository.countByTenantIdAndStatus(tenantId, status);
    }

    public Double getTotalRevenueByDateRange(String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        Double revenue = orderRepository.getTotalRevenueByTenantIdAndDateRange(tenantId, startDate, endDate);
        return revenue != null ? revenue : 0.0;
    }

    public Long getOrderCountByDateRange(String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countByTenantIdAndDateRange(tenantId, startDate, endDate);
    }

    public List<Object[]> getDailyOrdersAnalytics(String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.getDailyOrdersAnalytics(tenantId, startDate, endDate);
    }

    public Map<String, Long> getOrderStatusCounts(String tenantId) {
        List<Object[]> results = orderRepository.getOrderStatusCounts(tenantId);
        Map<String, Long> statusCounts = new HashMap<>();
        
        for (Object[] result : results) {
            String status = (String) result[0];
            Long count = (Long) result[1];
            statusCounts.put(status, count);
        }
        
        return statusCounts;
    }

    // Order lifecycle methods
    public Order confirmOrder(String tenantId, String orderId) {
        return orderRepository.findByTenantIdAndOrderId(tenantId, orderId)
                .map(order -> {
                    order.setStatus(OrderStatus.CONFIRMED);
                    return orderRepository.save(order);
                })
                .orElse(null);
    }

    public Order shipOrder(String tenantId, String orderId, String trackingNumber) {
        return orderRepository.findByTenantIdAndOrderId(tenantId, orderId)
                .map(order -> {
                    order.setStatus(OrderStatus.SHIPPED);
                    order.setTrackingNumber(trackingNumber);
                    order.setShippedDate(LocalDateTime.now());
                    return orderRepository.save(order);
                })
                .orElse(null);
    }

    public Order deliverOrder(String tenantId, String orderId) {
        return orderRepository.findByTenantIdAndOrderId(tenantId, orderId)
                .map(order -> {
                    order.setStatus(OrderStatus.DELIVERED);
                    order.setDeliveredDate(LocalDateTime.now());
                    return orderRepository.save(order);
                })
                .orElse(null);
    }

    public Order cancelOrder(String tenantId, String orderId, String reason) {
        return orderRepository.findByTenantIdAndOrderId(tenantId, orderId)
                .map(order -> {
                    order.setStatus(OrderStatus.CANCELLED);
                    order.setNotes(order.getNotes() != null ? 
                        order.getNotes() + "\n\nCancelled: " + reason : 
                        "Cancelled: " + reason);
                    return orderRepository.save(order);
                })
                .orElse(null);
    }
}

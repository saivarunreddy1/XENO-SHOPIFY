package com.xeno.assignment.repository;

import com.xeno.assignment.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByTenantIdOrderByOrderDateDesc(String tenantId);
    
    Page<Order> findByTenantIdOrderByOrderDateDesc(String tenantId, Pageable pageable);
    
    Optional<Order> findByTenantIdAndOrderId(String tenantId, String orderId);
    
    List<Order> findByTenantIdAndCustomerIdOrderByOrderDateDesc(String tenantId, Long customerId);
    
    @Query("SELECT o FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND o.status = :status ORDER BY o.orderDate DESC")
    List<Order> findByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") String status);
    
    @Query("SELECT o FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate ORDER BY o.orderDate DESC")
    List<Order> findByTenantIdAndOrderDateBetween(
        @Param("tenantId") String tenantId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT COUNT(o) FROM AssignmentOrder o WHERE o.tenantId = :tenantId")
    Long countByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT SUM(o.totalAmount) FROM AssignmentOrder o WHERE o.tenantId = :tenantId")
    Double getTotalRevenueByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT COUNT(o) FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND o.status = :status")
    Long countByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") String status);
    
    @Query("SELECT SUM(o.totalAmount) FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate")
    Double getTotalRevenueByTenantIdAndDateRange(
        @Param("tenantId") String tenantId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT COUNT(o) FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate")
    Long countByTenantIdAndDateRange(
        @Param("tenantId") String tenantId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    // Daily orders analytics
    @Query("SELECT DATE(o.orderDate) as date, COUNT(o) as orderCount, SUM(o.totalAmount) as revenue " +
           "FROM AssignmentOrder o WHERE o.tenantId = :tenantId AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate " +
           "GROUP BY DATE(o.orderDate) ORDER BY DATE(o.orderDate)")
    List<Object[]> getDailyOrdersAnalytics(
        @Param("tenantId") String tenantId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    // Recent orders
    @Query("SELECT o FROM AssignmentOrder o WHERE o.tenantId = :tenantId ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(@Param("tenantId") String tenantId, Pageable pageable);
    
    // Orders by status
    @Query("SELECT o.status, COUNT(o) FROM AssignmentOrder o WHERE o.tenantId = :tenantId GROUP BY o.status")
    List<Object[]> getOrderStatusCounts(@Param("tenantId") String tenantId);
}

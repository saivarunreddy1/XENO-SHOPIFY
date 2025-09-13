package com.xeno.shopify.repository;

import com.xeno.shopify.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Repository
public interface ShopifyOrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByShopifyId(String shopifyId);
    
    Optional<Order> findByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    Optional<Order> findByTenantIdAndShopifyId(String tenantId, String shopifyId);
    
    List<Order> findByTenantId(String tenantId);
    
    List<Order> findByCustomerId(Long customerId);
    
    List<Order> findByTenantIdAndCustomerId(String tenantId, Long customerId);
    
    boolean existsByShopifyId(String shopifyId);
    
    boolean existsByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    long countByTenantId(String tenantId);
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.tenantId = :tenantId")
    BigDecimal getTotalRevenueByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenantId = :tenantId AND o.createdAt >= :since")
    long countByTenantIdAndCreatedAtAfter(@Param("tenantId") String tenantId, @Param("since") LocalDateTime since);
}

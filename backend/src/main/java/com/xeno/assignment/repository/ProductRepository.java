package com.xeno.assignment.repository;

import com.xeno.assignment.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByTenantIdAndIsActiveOrderByCreatedAtDesc(String tenantId, Boolean isActive);
    
    Page<Product> findByTenantIdAndIsActiveOrderByCreatedAtDesc(String tenantId, Boolean isActive, Pageable pageable);
    
    Optional<Product> findByTenantIdAndProductId(String tenantId, String productId);
    
    Optional<Product> findByTenantIdAndSku(String tenantId, String sku);
    
    @Query("SELECT p FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findByTenantIdAndNameOrCategoryOrSkuContainingIgnoreCase(
        @Param("tenantId") String tenantId, 
        @Param("search") String search
    );
    
    List<Product> findByTenantIdAndCategory(String tenantId, String category);
    
    @Query("SELECT p FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true AND " +
           "p.inventoryQuantity <= p.lowStockThreshold ORDER BY p.inventoryQuantity ASC")
    List<Product> findLowStockProducts(@Param("tenantId") String tenantId);
    
    @Query("SELECT p FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true " +
           "ORDER BY p.totalSales DESC")
    List<Product> findTopSellingProducts(@Param("tenantId") String tenantId, Pageable pageable);
    
    @Query("SELECT p FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true " +
           "ORDER BY p.totalRevenue DESC")
    List<Product> findTopRevenueProducts(@Param("tenantId") String tenantId, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true")
    Long countActiveProductsByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT SUM(p.totalRevenue) FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true")
    Double getTotalRevenueByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT DISTINCT p.category FROM AssignmentProduct p WHERE p.tenantId = :tenantId AND p.isActive = true ORDER BY p.category")
    List<String> findDistinctCategoriesByTenantId(@Param("tenantId") String tenantId);
}

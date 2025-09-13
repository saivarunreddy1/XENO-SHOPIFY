package com.xeno.assignment.repository;

import com.xeno.assignment.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    List<Customer> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    
    Page<Customer> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);
    
    Optional<Customer> findByTenantIdAndCustomerId(String tenantId, String customerId);
    
    Optional<Customer> findByTenantIdAndEmail(String tenantId, String email);
    
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND " +
           "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Customer> findByTenantIdAndNameOrEmailContainingIgnoreCase(
        @Param("tenantId") String tenantId, 
        @Param("search") String search
    );
    
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId ORDER BY c.totalSpent DESC")
    List<Customer> findTopCustomersBySpending(
        @Param("tenantId") String tenantId, 
        Pageable pageable
    );
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.tenantId = :tenantId")
    Long countByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT SUM(c.totalSpent) FROM Customer c WHERE c.tenantId = :tenantId")
    Double getTotalRevenueByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND c.ordersCount > 1 ORDER BY c.totalSpent DESC")
    List<Customer> findReturningCustomers(@Param("tenantId") String tenantId, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND c.ordersCount = 1 ORDER BY c.createdAt DESC")
    List<Customer> findNewCustomers(@Param("tenantId") String tenantId, Pageable pageable);
}

package com.xeno.shopify.repository;

import com.xeno.shopify.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ShopifyCustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByShopifyId(String shopifyId);
    
    Optional<Customer> findByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    Optional<Customer> findByTenantIdAndShopifyId(String tenantId, String shopifyId);
    
    List<Customer> findByTenantId(String tenantId);
    
    List<Customer> findByEmail(String email);
    
    boolean existsByShopifyId(String shopifyId);
    
    boolean existsByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    long countByTenantId(String tenantId);
}

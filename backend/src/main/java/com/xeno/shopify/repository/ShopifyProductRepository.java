package com.xeno.shopify.repository;

import com.xeno.shopify.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ShopifyProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findByShopifyId(String shopifyId);
    
    Optional<Product> findByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    Optional<Product> findByTenantIdAndShopifyId(String tenantId, String shopifyId);
    
    List<Product> findByTenantId(String tenantId);
    
    List<Product> findByTitle(String title);
    
    List<Product> findByTenantIdAndTitle(String tenantId, String title);
    
    boolean existsByShopifyId(String shopifyId);
    
    boolean existsByShopifyIdAndTenantId(String shopifyId, String tenantId);
    
    long countByTenantId(String tenantId);
}

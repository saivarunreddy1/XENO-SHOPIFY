package com.xeno.shopify.repository;

import com.xeno.shopify.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    Optional<Tenant> findByTenantId(String tenantId);
    
    Optional<Tenant> findByShopDomain(String shopDomain);
    
    List<Tenant> findByIsActiveTrue();
    
    List<Tenant> findByIsActive(boolean isActive);
    
    boolean existsByTenantId(String tenantId);
    
    boolean existsByShopDomain(String shopDomain);
    
    long countByIsActiveTrue();
}

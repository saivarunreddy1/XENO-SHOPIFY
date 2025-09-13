package com.xeno.shopify.repository;

import com.xeno.shopify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndTenantId(String email, String tenantId);
    
    List<User> findByTenantId(String tenantId);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmailAndTenantId(String email, String tenantId);
    
    long countByTenantId(String tenantId);
}

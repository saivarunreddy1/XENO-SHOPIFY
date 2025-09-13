package com.xeno.assignment.controller;

import com.xeno.assignment.entity.Customer;
import com.xeno.assignment.service.CustomerService;
import com.xeno.assignment.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getTenantId(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromRequest(request);
        if (token != null) {
            return jwtUtil.getTenantIdFromToken(token);
        }
        return "demo-tenant"; // Default for now
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(
            HttpServletRequest request,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        
        String tenantId = getTenantId(request);
        
        if (search != null && !search.isEmpty()) {
            List<Customer> customers = customerService.searchCustomers(tenantId, search);
            return ResponseEntity.ok(customers);
        }
        
        if (page != null && size != null) {
            Page<Customer> customersPage = customerService.getAllCustomers(tenantId, page, size);
            return ResponseEntity.ok(customersPage.getContent());
        }
        
        List<Customer> customers = customerService.getAllCustomers(tenantId);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        Optional<Customer> customer = customerService.getCustomerById(tenantId, id);
        
        return customer.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer-id/{customerId}")
    public ResponseEntity<Customer> getCustomerByCustomerId(
            HttpServletRequest request,
            @PathVariable String customerId) {
        
        String tenantId = getTenantId(request);
        Optional<Customer> customer = customerService.getCustomerByCustomerId(tenantId, customerId);
        
        return customer.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            HttpServletRequest request,
            @RequestBody Customer customer) {
        
        String tenantId = getTenantId(request);
        
        // Check if customer with email already exists
        if (customer.getEmail() != null) {
            Optional<Customer> existingCustomer = customerService.getCustomerByEmail(tenantId, customer.getEmail());
            if (existingCustomer.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        Customer createdCustomer = customerService.createCustomer(tenantId, customer);
        return ResponseEntity.ok(createdCustomer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Customer customerDetails) {
        
        String tenantId = getTenantId(request);
        Customer updatedCustomer = customerService.updateCustomer(tenantId, id, customerDetails);
        
        return updatedCustomer != null ? 
                ResponseEntity.ok(updatedCustomer) : 
                ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        boolean deleted = customerService.deleteCustomer(tenantId, id);
        
        return deleted ? 
                ResponseEntity.ok().build() : 
                ResponseEntity.notFound().build();
    }

    @GetMapping("/top-spenders")
    public ResponseEntity<List<Customer>> getTopCustomers(
            HttpServletRequest request,
            @RequestParam(defaultValue = "10") int limit) {
        
        String tenantId = getTenantId(request);
        List<Customer> topCustomers = customerService.getTopCustomersBySpending(tenantId, limit);
        return ResponseEntity.ok(topCustomers);
    }

    @GetMapping("/stats")
    public ResponseEntity<CustomerStats> getCustomerStats(HttpServletRequest request) {
        String tenantId = getTenantId(request);
        
        CustomerStats stats = new CustomerStats();
        stats.totalCustomers = customerService.getCustomerCount(tenantId);
        stats.totalRevenue = customerService.getTotalCustomerRevenue(tenantId);
        stats.returningCustomers = customerService.getReturningCustomers(tenantId, 5);
        stats.newCustomers = customerService.getNewCustomers(tenantId, 5);
        
        return ResponseEntity.ok(stats);
    }

    // Inner class for customer statistics
    public static class CustomerStats {
        public Long totalCustomers;
        public Double totalRevenue;
        public List<Customer> returningCustomers;
        public List<Customer> newCustomers;
    }
}

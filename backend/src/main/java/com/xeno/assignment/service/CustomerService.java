package com.xeno.assignment.service;

import com.xeno.assignment.entity.Customer;
import com.xeno.assignment.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers(String tenantId) {
        return customerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public Page<Customer> getAllCustomers(String tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return customerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    public Optional<Customer> getCustomerById(String tenantId, Long id) {
        return customerRepository.findById(id)
                .filter(customer -> customer.getTenantId().equals(tenantId));
    }

    public Optional<Customer> getCustomerByCustomerId(String tenantId, String customerId) {
        return customerRepository.findByTenantIdAndCustomerId(tenantId, customerId);
    }

    public Optional<Customer> getCustomerByEmail(String tenantId, String email) {
        return customerRepository.findByTenantIdAndEmail(tenantId, email);
    }

    public Customer createCustomer(String tenantId, Customer customer) {
        // Generate customer ID if not provided
        if (customer.getCustomerId() == null || customer.getCustomerId().isEmpty()) {
            customer.setCustomerId("CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        customer.setTenantId(tenantId);
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(String tenantId, Long id, Customer customerDetails) {
        return customerRepository.findById(id)
                .filter(customer -> customer.getTenantId().equals(tenantId))
                .map(customer -> {
                    customer.setFirstName(customerDetails.getFirstName());
                    customer.setLastName(customerDetails.getLastName());
                    customer.setEmail(customerDetails.getEmail());
                    customer.setPhone(customerDetails.getPhone());
                    customer.setAddress(customerDetails.getAddress());
                    customer.setCity(customerDetails.getCity());
                    customer.setState(customerDetails.getState());
                    customer.setCountry(customerDetails.getCountry());
                    customer.setPostalCode(customerDetails.getPostalCode());
                    return customerRepository.save(customer);
                })
                .orElse(null);
    }

    public boolean deleteCustomer(String tenantId, Long id) {
        return customerRepository.findById(id)
                .filter(customer -> customer.getTenantId().equals(tenantId))
                .map(customer -> {
                    customerRepository.delete(customer);
                    return true;
                })
                .orElse(false);
    }

    public List<Customer> searchCustomers(String tenantId, String searchTerm) {
        return customerRepository.findByTenantIdAndNameOrEmailContainingIgnoreCase(tenantId, searchTerm);
    }

    public List<Customer> getTopCustomersBySpending(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return customerRepository.findTopCustomersBySpending(tenantId, pageable);
    }

    public Long getCustomerCount(String tenantId) {
        return customerRepository.countByTenantId(tenantId);
    }

    public Double getTotalCustomerRevenue(String tenantId) {
        return customerRepository.getTotalRevenueByTenantId(tenantId);
    }

    public List<Customer> getReturningCustomers(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return customerRepository.findReturningCustomers(tenantId, pageable);
    }

    public List<Customer> getNewCustomers(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return customerRepository.findNewCustomers(tenantId, pageable);
    }

    // Update customer statistics when orders change
    public void updateCustomerStatistics(String tenantId, String customerId, Double orderAmount, boolean isNewOrder) {
        customerRepository.findByTenantIdAndCustomerId(tenantId, customerId)
                .ifPresent(customer -> {
                    if (isNewOrder) {
                        customer.setOrdersCount(customer.getOrdersCount() + 1);
                        customer.setTotalSpent(customer.getTotalSpent() + orderAmount);
                        customer.setLastOrderDate(java.time.LocalDateTime.now());
                    }
                    customerRepository.save(customer);
                });
    }
}

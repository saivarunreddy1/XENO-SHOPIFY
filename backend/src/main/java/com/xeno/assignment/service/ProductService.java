package com.xeno.assignment.service;

import com.xeno.assignment.entity.Product;
import com.xeno.assignment.repository.ProductRepository;
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
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts(String tenantId) {
        return productRepository.findByTenantIdAndIsActiveOrderByCreatedAtDesc(tenantId, true);
    }

    public Page<Product> getAllProducts(String tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByTenantIdAndIsActiveOrderByCreatedAtDesc(tenantId, true, pageable);
    }

    public Optional<Product> getProductById(String tenantId, Long id) {
        return productRepository.findById(id)
                .filter(product -> product.getTenantId().equals(tenantId));
    }

    public Optional<Product> getProductByProductId(String tenantId, String productId) {
        return productRepository.findByTenantIdAndProductId(tenantId, productId);
    }

    public Optional<Product> getProductBySku(String tenantId, String sku) {
        return productRepository.findByTenantIdAndSku(tenantId, sku);
    }

    public Product createProduct(String tenantId, Product product) {
        // Generate product ID if not provided
        if (product.getProductId() == null || product.getProductId().isEmpty()) {
            product.setProductId("PROD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        // Generate SKU if not provided
        if (product.getSku() == null || product.getSku().isEmpty()) {
            product.setSku("SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        product.setTenantId(tenantId);
        return productRepository.save(product);
    }

    public Product updateProduct(String tenantId, Long id, Product productDetails) {
        return productRepository.findById(id)
                .filter(product -> product.getTenantId().equals(tenantId))
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setDescription(productDetails.getDescription());
                    product.setCategory(productDetails.getCategory());
                    product.setPrice(productDetails.getPrice());
                    product.setCostPrice(productDetails.getCostPrice());
                    product.setSku(productDetails.getSku());
                    product.setBarcode(productDetails.getBarcode());
                    product.setInventoryQuantity(productDetails.getInventoryQuantity());
                    product.setLowStockThreshold(productDetails.getLowStockThreshold());
                    product.setWeight(productDetails.getWeight());
                    product.setDimensions(productDetails.getDimensions());
                    product.setImageUrl(productDetails.getImageUrl());
                    product.setIsActive(productDetails.getIsActive());
                    return productRepository.save(product);
                })
                .orElse(null);
    }

    public boolean deleteProduct(String tenantId, Long id) {
        return productRepository.findById(id)
                .filter(product -> product.getTenantId().equals(tenantId))
                .map(product -> {
                    product.setIsActive(false); // Soft delete
                    productRepository.save(product);
                    return true;
                })
                .orElse(false);
    }

    public List<Product> searchProducts(String tenantId, String searchTerm) {
        return productRepository.findByTenantIdAndNameOrCategoryOrSkuContainingIgnoreCase(tenantId, searchTerm);
    }

    public List<Product> getProductsByCategory(String tenantId, String category) {
        return productRepository.findByTenantIdAndCategory(tenantId, category);
    }

    public List<Product> getLowStockProducts(String tenantId) {
        return productRepository.findLowStockProducts(tenantId);
    }

    public List<Product> getTopSellingProducts(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findTopSellingProducts(tenantId, pageable);
    }

    public List<Product> getTopRevenueProducts(String tenantId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findTopRevenueProducts(tenantId, pageable);
    }

    public Long getProductCount(String tenantId) {
        return productRepository.countActiveProductsByTenantId(tenantId);
    }

    public Double getTotalProductRevenue(String tenantId) {
        return productRepository.getTotalRevenueByTenantId(tenantId);
    }

    public List<String> getProductCategories(String tenantId) {
        return productRepository.findDistinctCategoriesByTenantId(tenantId);
    }

    // Update product statistics when orders change
    public void updateProductStatistics(String tenantId, String productId, Integer quantity, Double revenue, boolean isNewSale) {
        productRepository.findByTenantIdAndProductId(tenantId, productId)
                .ifPresent(product -> {
                    if (isNewSale) {
                        product.setTotalSales(product.getTotalSales() + quantity);
                        product.setTotalRevenue(product.getTotalRevenue() + revenue);
                        product.setInventoryQuantity(product.getInventoryQuantity() - quantity);
                    }
                    productRepository.save(product);
                });
    }
}

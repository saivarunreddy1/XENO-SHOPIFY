package com.xeno.assignment.controller;

import com.xeno.assignment.entity.Product;
import com.xeno.assignment.service.ProductService;
import com.xeno.assignment.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

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
    public ResponseEntity<List<Product>> getAllProducts(
            HttpServletRequest request,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        
        String tenantId = getTenantId(request);
        
        if (search != null && !search.isEmpty()) {
            List<Product> products = productService.searchProducts(tenantId, search);
            return ResponseEntity.ok(products);
        }
        
        if (category != null && !category.isEmpty()) {
            List<Product> products = productService.getProductsByCategory(tenantId, category);
            return ResponseEntity.ok(products);
        }
        
        if (page != null && size != null) {
            Page<Product> productsPage = productService.getAllProducts(tenantId, page, size);
            return ResponseEntity.ok(productsPage.getContent());
        }
        
        List<Product> products = productService.getAllProducts(tenantId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        Optional<Product> product = productService.getProductById(tenantId, id);
        
        return product.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product-id/{productId}")
    public ResponseEntity<Product> getProductByProductId(
            HttpServletRequest request,
            @PathVariable String productId) {
        
        String tenantId = getTenantId(request);
        Optional<Product> product = productService.getProductByProductId(tenantId, productId);
        
        return product.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<Product> getProductBySku(
            HttpServletRequest request,
            @PathVariable String sku) {
        
        String tenantId = getTenantId(request);
        Optional<Product> product = productService.getProductBySku(tenantId, sku);
        
        return product.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            HttpServletRequest request,
            @RequestBody Product product) {
        
        String tenantId = getTenantId(request);
        
        // Check if product with SKU already exists
        if (product.getSku() != null) {
            Optional<Product> existingProduct = productService.getProductBySku(tenantId, product.getSku());
            if (existingProduct.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        Product createdProduct = productService.createProduct(tenantId, product);
        return ResponseEntity.ok(createdProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Product productDetails) {
        
        String tenantId = getTenantId(request);
        Product updatedProduct = productService.updateProduct(tenantId, id, productDetails);
        
        return updatedProduct != null ? 
                ResponseEntity.ok(updatedProduct) : 
                ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            HttpServletRequest request,
            @PathVariable Long id) {
        
        String tenantId = getTenantId(request);
        boolean deleted = productService.deleteProduct(tenantId, id);
        
        return deleted ? 
                ResponseEntity.ok().build() : 
                ResponseEntity.notFound().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getProductCategories(HttpServletRequest request) {
        String tenantId = getTenantId(request);
        List<String> categories = productService.getProductCategories(tenantId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(HttpServletRequest request) {
        String tenantId = getTenantId(request);
        List<Product> lowStockProducts = productService.getLowStockProducts(tenantId);
        return ResponseEntity.ok(lowStockProducts);
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<Product>> getTopSellingProducts(
            HttpServletRequest request,
            @RequestParam(defaultValue = "10") int limit) {
        
        String tenantId = getTenantId(request);
        List<Product> topProducts = productService.getTopSellingProducts(tenantId, limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/top-revenue")
    public ResponseEntity<List<Product>> getTopRevenueProducts(
            HttpServletRequest request,
            @RequestParam(defaultValue = "10") int limit) {
        
        String tenantId = getTenantId(request);
        List<Product> topProducts = productService.getTopRevenueProducts(tenantId, limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/stats")
    public ResponseEntity<ProductStats> getProductStats(HttpServletRequest request) {
        String tenantId = getTenantId(request);
        
        ProductStats stats = new ProductStats();
        stats.totalProducts = productService.getProductCount(tenantId);
        stats.totalRevenue = productService.getTotalProductRevenue(tenantId);
        stats.categories = productService.getProductCategories(tenantId);
        stats.lowStockProducts = productService.getLowStockProducts(tenantId);
        stats.topSellingProducts = productService.getTopSellingProducts(tenantId, 5);
        
        return ResponseEntity.ok(stats);
    }

    // Inner class for product statistics
    public static class ProductStats {
        public Long totalProducts;
        public Double totalRevenue;
        public List<String> categories;
        public List<Product> lowStockProducts;
        public List<Product> topSellingProducts;
    }
}

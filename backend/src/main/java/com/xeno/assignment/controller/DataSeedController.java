package com.xeno.assignment.controller;

import com.xeno.assignment.entity.Customer;
import com.xeno.assignment.entity.Product;
import com.xeno.assignment.entity.Order;
import com.xeno.assignment.entity.OrderItem;
import com.xeno.assignment.entity.OrderStatus;
import com.xeno.assignment.service.CustomerService;
import com.xeno.assignment.service.ProductService;
import com.xeno.assignment.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = "http://localhost:3000")
public class DataSeedController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/demo-data")
    public ResponseEntity<String> seedDemoData(@RequestParam(defaultValue = "demo-tenant") String tenantId) {
        try {
            // Create sample customers
            List<Customer> customers = createSampleCustomers(tenantId);
            
            // Create sample products
            List<Product> products = createSampleProducts(tenantId);
            
            // Create sample orders
            createSampleOrders(tenantId, customers, products);
            
            return ResponseEntity.ok("Demo data seeded successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error seeding data: " + e.getMessage());
        }
    }

    private List<Customer> createSampleCustomers(String tenantId) {
        List<Customer> customers = new ArrayList<>();
        
        String[][] customerData = {
            {"John", "Smith", "john.smith@example.com", "+1-555-123-4567", "123 Main St", "New York", "NY", "USA", "10001"},
            {"Jane", "Doe", "jane.doe@example.com", "+1-555-987-6543", "456 Oak Avenue", "Los Angeles", "CA", "USA", "90210"},
            {"Mike", "Johnson", "mike.johnson@example.com", "+1-555-456-7890", "789 Pine Street", "Chicago", "IL", "USA", "60601"},
            {"Sarah", "Wilson", "sarah.wilson@example.com", "+1-555-321-0987", "321 Elm Street", "Miami", "FL", "USA", "33101"},
            {"David", "Brown", "david.brown@example.com", "+1-555-654-3210", "654 Cedar Ave", "Seattle", "WA", "USA", "98101"},
            {"Emily", "Davis", "emily.davis@example.com", "+1-555-789-0123", "789 Maple Dr", "Denver", "CO", "USA", "80201"}
        };

        for (String[] data : customerData) {
            Customer customer = new Customer(tenantId, null, data[0], data[1], data[2]);
            customer.setPhone(data[3]);
            customer.setAddress(data[4]);
            customer.setCity(data[5]);
            customer.setState(data[6]);
            customer.setCountry(data[7]);
            customer.setPostalCode(data[8]);
            customer.setCreatedAt(LocalDateTime.now().minusDays(new Random().nextInt(365)));
            
            Customer savedCustomer = customerService.createCustomer(tenantId, customer);
            customers.add(savedCustomer);
        }
        
        return customers;
    }

    private List<Product> createSampleProducts(String tenantId) {
        List<Product> products = new ArrayList<>();
        
        Object[][] productData = {
            {"AirPods Pro (3rd Gen)", "Premium wireless earbuds with active noise cancellation", "Electronics", 249.99, 199.99, 150, 20},
            {"iPhone 15 Pro Max Case", "Protective case for iPhone 15 Pro Max", "Accessories", 45.99, 20.00, 300, 50},
            {"MacBook Pro M3 Stand", "Aluminum stand for MacBook Pro", "Accessories", 89.99, 45.00, 75, 10},
            {"Wireless Charging Pad", "Fast wireless charger for Qi-enabled devices", "Electronics", 35.99, 18.00, 200, 30},
            {"Premium Coffee Beans 1kg", "Organic single-origin coffee beans", "Food & Beverage", 24.99, 12.00, 500, 25},
            {"Organic Cotton T-Shirt", "100% organic cotton t-shirt", "Clothing", 28.99, 15.00, 250, 30},
            {"Smart Fitness Tracker", "Advanced fitness tracking with heart rate monitor", "Electronics", 199.99, 120.00, 100, 15},
            {"Bluetooth Mechanical Keyboard", "RGB backlit mechanical keyboard", "Electronics", 129.99, 75.00, 80, 10},
            {"Premium Yoga Mat", "Non-slip yoga mat with carrying strap", "Fitness", 67.99, 30.00, 120, 20},
            {"Stainless Steel Water Bottle", "Insulated water bottle 32oz", "Lifestyle", 32.99, 15.00, 300, 40}
        };

        for (Object[] data : productData) {
            Product product = new Product(tenantId, null, (String) data[0], (Double) data[3]);
            product.setDescription((String) data[1]);
            product.setCategory((String) data[2]);
            product.setCostPrice((Double) data[4]);
            product.setInventoryQuantity((Integer) data[5]);
            product.setLowStockThreshold((Integer) data[6]);
            product.setCreatedAt(LocalDateTime.now().minusDays(new Random().nextInt(180)));
            
            Product savedProduct = productService.createProduct(tenantId, product);
            products.add(savedProduct);
        }
        
        return products;
    }

    private void createSampleOrders(String tenantId, List<Customer> customers, List<Product> products) {
        Random random = new Random();
        
        // Create 50 sample orders
        for (int i = 0; i < 50; i++) {
            Customer randomCustomer = customers.get(random.nextInt(customers.size()));
            
            Order order = new Order(tenantId, null, randomCustomer, 0.0);
            order.setOrderDate(LocalDateTime.now().minusDays(random.nextInt(90)));
            
            // Set random status
            OrderStatus[] statuses = OrderStatus.values();
            OrderStatus status = statuses[random.nextInt(statuses.length)];
            order.setStatus(status);
            
            if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) {
                order.setShippedDate(order.getOrderDate().plusDays(1 + random.nextInt(3)));
                order.setTrackingNumber("TRK" + (100000000 + random.nextInt(900000000)));
            }
            
            if (status == OrderStatus.DELIVERED) {
                order.setDeliveredDate(order.getShippedDate().plusDays(1 + random.nextInt(5)));
            }
            
            order.setShippingAddress(randomCustomer.getAddress() + ", " + 
                                   randomCustomer.getCity() + ", " + 
                                   randomCustomer.getState() + " " + 
                                   randomCustomer.getPostalCode());
            
            // Add random order items
            List<OrderItem> orderItems = new ArrayList<>();
            int numItems = 1 + random.nextInt(4); // 1-4 items per order
            double orderTotal = 0.0;
            
            for (int j = 0; j < numItems; j++) {
                Product randomProduct = products.get(random.nextInt(products.size()));
                int quantity = 1 + random.nextInt(3); // 1-3 quantity
                
                OrderItem item = new OrderItem(order, randomProduct, quantity, randomProduct.getPrice());
                orderItems.add(item);
                orderTotal += item.getTotalPrice();
            }
            
            order.setOrderItems(orderItems);
            order.setSubtotal(orderTotal);
            order.setTotalAmount(orderTotal);
            
            orderService.createOrder(tenantId, order);
        }
    }
}

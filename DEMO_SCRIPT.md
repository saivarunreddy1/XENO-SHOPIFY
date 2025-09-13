# 🎥 Demo Video Script (Max 7 minutes)

## Introduction (30 seconds)
- "Hi, I'm [Your Name] and I've built a multi-tenant Shopify Data Ingestion & Insights Service for the Xeno FDE internship assignment"
- "This solution helps enterprise retailers onboard multiple Shopify stores and analyze their customer data in one unified dashboard"

## Features Overview (1.5 minutes)

### 1. Show the Application (30 seconds)
- Open browser to http://localhost:3000
- "Here's the React frontend with Material-UI design"
- Show login page: "Authentication using JWT tokens"

### 2. Multi-Tenant Architecture (30 seconds)
- Login and show tenant switcher in header
- "Notice the tenant indicator - this shows we're viewing data for a specific Shopify store"
- "All data is isolated per tenant for security"

### 3. Dashboard Features (30 seconds)
- Navigate through dashboard
- "We have key metrics: customers, orders, revenue, conversion rates"
- "Recent orders with status tracking"
- "Quick actions for Shopify sync and reporting"

## Technical Deep Dive (2.5 minutes)

### 1. Backend Architecture (45 seconds)
- Show code in VS Code/IDE
- "Spring Boot backend with multi-tenant data model"
- Show ShopifyService.java: "This handles data ingestion from Shopify APIs"
- Show database models: "JPA entities with tenant isolation"

### 2. Database Design (45 seconds)
- Open database/schema.sql
- "MySQL database with proper relationships"
- "Every table has tenant_id for data isolation"
- Show sample data: "We have demo tenants with realistic data"

### 3. API Integration (45 seconds)
- Show AnalyticsController.java
- "REST APIs for dashboard metrics, customer analytics, order trends"
- "JWT-based authentication with tenant context"
- Show Postman/curl: "API responds with tenant-specific data"

### 4. Real-time Features (35 seconds)
- Show ShopifyWebhookController.java
- "Webhook endpoints for real-time data sync"
- Show scheduled sync: "Automatic data updates every hour"

## Problem-Solving Approach (1.5 minutes)

### 1. Multi-Tenancy Challenge (30 seconds)
- "Main challenge was ensuring complete data isolation between tenants"
- "Solution: tenant_id in all entities + JWT with tenant context"
- "Every query is automatically scoped to the user's tenant"

### 2. Real-world Complexity (30 seconds)
- "Built for scalability with proper separation of concerns"
- "Service layer for business logic, repository layer for data access"
- "Error handling and fallback to sample data for demo purposes"

### 3. Performance Considerations (30 seconds)
- "Connection pooling for database efficiency"
- "Scheduled sync to reduce API calls"
- "Caching strategy for frequently accessed data"

## Trade-offs & Limitations (1 minute)

### 1. Current Limitations (30 seconds)
- "Currently using mock Shopify data for demo purposes"
- "Would need actual Shopify app credentials for production"
- "Basic authentication - would enhance with OAuth in production"

### 2. Production Readiness (30 seconds)
- "Would add Redis for caching and session management"
- "Queue system like RabbitMQ for async processing"
- "Enhanced monitoring and logging"
- "Proper CI/CD pipeline for deployments"

## Wrap-up (30 seconds)
- "This demonstrates core FDE skills: API integration, multi-tenant architecture, and customer-facing dashboard"
- "The solution is deployable and handles real-world complexity"
- "Thank you for your time, I'm excited about the opportunity to work with Xeno!"

---

## Recording Tips:
1. **Prepare environment**: Clear desktop, close unnecessary apps
2. **Test audio/video**: Ensure good quality
3. **Practice once**: Time the demo to stay under 7 minutes
4. **Show confidence**: Explain your technical decisions clearly
5. **Have backup**: Record multiple takes if needed

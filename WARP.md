# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Xeno FDE Internship Assignment 2025** - a multi-tenant Shopify Data Ingestion & Insights Service. The system provides analytics dashboards for multiple Shopify stores with complete tenant isolation, real-time data synchronization, and comprehensive business insights.

**Key Technologies:**
- Backend: Spring Boot 3.x + Java 17 + MySQL 8.0
- Frontend: React 18 + Material-UI + Chart.js/Recharts  
- Infrastructure: Docker + Docker Compose
- Integration: Shopify REST APIs + Webhooks

## Development Commands

### Quick Start (Recommended)
```bash
# Complete environment setup with one command
.\setup.sh
```

### Docker Development (Primary Workflow)
```bash
# Start all services (MySQL, backend, frontend, Redis, Nginx)
docker-compose up -d

# Start specific services only
docker-compose up -d mysql backend
docker-compose up -d frontend

# View logs for debugging
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild and restart after code changes
docker-compose up --build -d

# Stop all services
docker-compose down

# Reset database and volumes
docker-compose down -v
```

### Backend Development
```bash
# Local development (requires Java 17+ and Maven 3.8+)
cd backend
mvn clean install
mvn spring-boot:run

# Run tests
mvn test
mvn test -Dtest=CustomerServiceTest
mvn test -Dspring.profiles.active=test

# Build Docker image
docker build -t xeno-backend .
```

### Frontend Development  
```bash
# Local development (requires Node.js 18+)
cd frontend
npm install
npm start

# Run tests
npm test
npm test -- --coverage
npm test -- --watchAll=false

# Production build
npm run build

# Build Docker image
docker build -t xeno-frontend .
```

### Database Operations
```bash
# Connect to MySQL (when running via Docker)
docker-compose exec mysql mysql -u xeno_user -pxeno_password xeno_shopify

# Run schema migration
docker-compose exec mysql mysql -u xeno_user -pxeno_password xeno_shopify < database/schema.sql

# Load seed data
docker-compose exec mysql mysql -u xeno_user -pxeno_password xeno_shopify < database/seed-data.sql
```

## Architecture & Multi-Tenancy

### Multi-Tenant Data Isolation
This system uses **schema-based multi-tenancy** with tenant isolation via `tenant_id` columns:

- **Every entity table** includes `tenant_id VARCHAR(255) NOT NULL`
- **All queries** are automatically filtered by tenant context from JWT token
- **Database indexes** use composite keys: `(tenant_id, shopify_id)`
- **Foreign keys** maintain referential integrity within tenant boundaries

### Core Entity Relationships
```
Tenants (1) → (*) Users, Customers, Products, Orders
Customers (1) → (*) Orders
Orders (1) → (*) OrderItems  
Products (1) → (*) OrderItems
```

### Authentication & Authorization Flow
1. User login → JWT token generated with embedded `tenantId`
2. All API requests include JWT in Authorization header
3. Security filter extracts `tenantId` and stores in request context
4. Repository methods automatically filter by `tenantId`
5. **Critical**: Never query across tenants - data leakage prevention

### Shopify Integration Patterns
- **Full Sync**: Scheduled nightly sync via `@Scheduled` methods
- **Real-time Updates**: Webhook endpoints for immediate data updates  
- **Rate Limiting**: Respects Shopify API limits (40 requests/app/second)
- **Error Handling**: Retry logic with exponential backoff

## Key File Locations

### Backend Structure
- **Main Application**: `backend/src/main/java/com/xeno/shopify/XenoShopifyApplication.java`
- **Configuration**: `backend/src/main/java/com/xeno/shopify/config/SecurityConfig.java`
- **Controllers**: `backend/src/main/java/com/xeno/shopify/controller/`
- **Services**: `backend/src/main/java/com/xeno/shopify/service/`
- **Repositories**: `backend/src/main/java/com/xeno/shopify/repository/`
- **Entities**: `backend/src/main/java/com/xeno/shopify/model/`
- **DTOs**: `backend/src/main/java/com/xeno/shopify/dto/`
- **Config**: `backend/src/main/resources/application.yml`

### Frontend Structure  
- **Main App**: `frontend/src/App.js`
- **Authentication Context**: `frontend/src/contexts/`
- **Page Components**: `frontend/src/pages/`
- **Reusable Components**: `frontend/src/components/`
- **API Services**: `frontend/src/services/`
- **Utilities**: `frontend/src/utils/`

### Database & Infrastructure
- **Schema**: `database/schema.sql` - Complete multi-tenant database structure
- **Seed Data**: `database/seed-data.sql` - Demo tenants, users, and sample data
- **Docker Config**: `docker-compose.yml` - Full development environment

## Development Guidelines

### Multi-Tenant Development Rules
1. **Always include tenant filtering** in repository methods:
   ```java
   List<Customer> findByTenantId(String tenantId);
   List<Order> findByTenantIdAndProcessedAtBetween(String tenantId, LocalDateTime start, LocalDateTime end);
   ```

2. **Use composite indexes** for performance:
   ```sql
   INDEX idx_tenant_shopify (tenant_id, shopify_id)
   INDEX idx_tenant_created (tenant_id, created_at)
   ```

3. **Validate tenant access** in service layers - never trust frontend-only validation

4. **Test cross-tenant isolation** - ensure data leakage is impossible

### API Development Patterns
- **RESTful endpoints**: Follow `/api/{entity}` convention
- **Consistent response format**: Use standardized JSON response wrapper
- **Pagination**: Always paginate large result sets
- **Error handling**: Return appropriate HTTP status codes with meaningful messages
- **JWT Authentication**: All endpoints except `/auth/*` require valid JWT tokens

### Shopify Integration Best Practices
- **Webhook verification**: Always verify webhook signatures for security
- **Idempotent processing**: Handle duplicate webhook deliveries gracefully  
- **Incremental sync**: Use `updated_at` timestamps to sync only changed data
- **API versioning**: Currently using Shopify API version `2023-10`

### Testing Approach
- **Unit tests**: Mock external dependencies (Shopify API, database)
- **Integration tests**: Use H2 in-memory database for repository tests
- **Multi-tenant tests**: Verify data isolation between tenants
- **API tests**: Test all REST endpoints with proper authentication

## Environment Configuration

### Local Development URLs
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080/api  
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Database**: localhost:3306 (xeno_shopify)
- **Redis Cache**: localhost:6379

### Demo Credentials
```
Email: admin@demo-fashion.com
Password: password123
Tenant: demo-fashion-store
```

### Environment Variables
Key configurations in `.env` files:
- `SPRING_DATASOURCE_URL`: Database connection string
- `JWT_SECRET`: Token signing secret (rotate in production)
- `REACT_APP_API_URL`: Frontend to backend communication
- Shopify API credentials per tenant in database

## Performance Considerations

### Database Optimization
- **Composite indexes**: `(tenant_id, shopify_id)` on all main tables
- **Analytics views**: Pre-computed metrics in database views
- **Connection pooling**: HikariCP configured for optimal connections
- **Query optimization**: Use JPA projections for large result sets

### Caching Strategy  
- **Application caching**: `@Cacheable` on expensive analytics calculations
- **Redis integration**: Session management and frequently accessed data
- **HTTP caching**: Proper cache headers for static analytics data

### Shopify API Optimization
- **Bulk operations**: Use Shopify GraphQL for large data imports
- **Rate limit handling**: Implement exponential backoff retry logic
- **Selective sync**: Only sync modified records using timestamps
- **Webhook processing**: Async processing to avoid blocking API requests

This multi-tenant architecture provides scalable Shopify analytics with complete data isolation while maintaining development efficiency through shared infrastructure.

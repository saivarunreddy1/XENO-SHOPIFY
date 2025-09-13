# Xeno FDE Internship Assignment - 2025

A multi-tenant Shopify Data Ingestion & Insights Service built with React, Spring Boot, and MySQL.

## 🏗️ Architecture Overview

This application consists of:
- **Backend**: Spring Boot REST API with multi-tenant data isolation
- **Frontend**: React.js dashboard with authentication and analytics
- **Database**: MySQL with tenant-based data separation
- **Integration**: Shopify API for real-time data ingestion

## 📁 Project Structure

```
xeno-fde-assignment/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   │   └── com/xeno/shopify/
│   │       ├── XenoShopifyApplication.java
│   │       ├── config/         # Database & security config
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Business logic
│   │       ├── repository/     # Data access layer
│   │       ├── model/          # Entity classes
│   │       └── dto/            # Data transfer objects
│   ├── src/main/resources/
│   │   ├── application.yml     # App configuration
│   │   └── data.sql           # Initial data
│   └── pom.xml                # Maven dependencies
├── frontend/                  # React application
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Main application pages
│   │   ├── services/         # API integration
│   │   ├── utils/            # Utilities and helpers
│   │   └── App.js            # Main app component
│   ├── package.json          # NPM dependencies
│   └── .env                  # Environment variables
├── database/
│   ├── schema.sql            # Database schema
│   └── seed-data.sql         # Sample data
├── docker-compose.yml        # Local development setup
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### 1. Database Setup
```bash
# Start MySQL with Docker
docker-compose up mysql -d

# Or install MySQL locally and create database
mysql -u root -p
CREATE DATABASE xeno_shopify;
```

### 2. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html

## 🔑 Key Features

### Multi-Tenant Architecture
- Tenant isolation using tenant_id in all entities
- Secure tenant context switching
- Isolated data access per tenant

### Shopify Integration
- Real-time data ingestion via Shopify APIs
- Webhook support for live updates
- Support for customers, orders, products

### Analytics Dashboard
- Customer insights and metrics
- Revenue analytics with date filtering
- Top customers by spending
- Order trends and patterns

### Security
- JWT-based authentication
- Email-based user registration
- Tenant-scoped data access

## 🏭 Deployment

This application is deployed on [Platform] and accessible at:
- Production URL: [TO_BE_UPDATED]

## 📊 Database Schema

### Core Entities
- `tenants`: Store information
- `users`: Dashboard users
- `customers`: Shopify customers
- `products`: Product catalog
- `orders`: Order transactions
- `order_items`: Individual order line items

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tenant Management
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/{id}` - Get tenant details

### Data Ingestion
- `POST /api/shopify/sync` - Manual data sync
- `POST /api/shopify/webhooks/{event}` - Webhook endpoints

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/customers/top` - Top customers
- `GET /api/analytics/orders/trends` - Order trends

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

## 📝 Assumptions & Trade-offs

1. **Single Database**: Using one MySQL instance with tenant isolation vs separate databases
2. **Simplified Auth**: Basic email/password auth instead of OAuth
3. **Memory Caching**: Using in-memory caching for development
4. **Webhook Security**: Basic webhook validation (can be enhanced)

## 🚀 Next Steps for Production

1. **Enhanced Security**
   - OAuth integration
   - Rate limiting
   - Input validation & sanitization

2. **Scalability**
   - Redis for caching
   - Queue system for async processing
   - Database connection pooling

3. **Monitoring**
   - Application metrics
   - Error tracking
   - Performance monitoring

4. **DevOps**
   - CI/CD pipeline
   - Environment management
   - Automated testing

## 🤝 Contributing

This is an internship assignment project. For any questions, please reach out to the development team.

## 📄 License

This project is part of Xeno FDE Internship Assignment 2025.

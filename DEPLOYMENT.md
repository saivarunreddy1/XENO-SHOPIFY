# Xeno FDE Assignment - Deployment Guide

This guide provides step-by-step instructions for deploying the Xeno Shopify Data Ingestion & Insights Service to various cloud platforms.

## 🚀 Quick Deploy Options

### Option 1: Render + Vercel (Recommended)
- **Backend**: Render.com (with managed PostgreSQL)
- **Frontend**: Vercel
- **Estimated Time**: 15-20 minutes

### Option 2: Railway (Full Stack)
- **Backend + Database**: Railway
- **Frontend**: Railway or Vercel
- **Estimated Time**: 10-15 minutes

### Option 3: Heroku (Traditional)
- **Backend**: Heroku with ClearDB MySQL
- **Frontend**: Netlify or Heroku
- **Estimated Time**: 20-25 minutes

## 📋 Prerequisites

1. **GitHub Account**: Repository must be public
2. **Cloud Platform Accounts**: 
   - Render.com account
   - Vercel account
   - Or Railway account
3. **Domain Names** (optional): Custom domains for production

## 🛠️ Deployment Steps

### Step 1: Prepare Repository

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Xeno FDE Assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/xeno-fde-assignment.git
git push -u origin main
```

2. **Environment Variables**:
   - Ensure all sensitive data uses environment variables
   - Update CORS settings for production domains

### Step 2: Deploy Backend (Render.com)

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `backend` folder as root directory

2. **Configure Build**:
   ```
   Build Command: mvn clean install -DskipTests
   Start Command: java -Dserver.port=$PORT -jar target/shopify-service-1.0.0.jar
   ```

3. **Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=production
   MYSQL_URL=<your-mysql-connection-string>
   MYSQL_USERNAME=root
   MYSQL_ROOT_PASSWORD=<your-password>
   JWT_SECRET=<generate-64-character-secret>
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   SHOPIFY_API_VERSION=2023-10
   ```

4. **Database Setup**:
   - Create PostgreSQL database in Render
   - Or use external MySQL provider (PlanetScale, AWS RDS)
   - Run database migrations:
   ```sql
   -- Execute schema.sql and seed-data.sql
   ```

### Step 3: Deploy Frontend (Vercel)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `frontend` folder as root directory

2. **Build Configuration**:
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-domain.onrender.com/api
   NODE_ENV=production
   ```

### Step 4: Alternative - Railway Deployment

1. **Deploy with Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Configure Services**:
   - Backend: Java Spring Boot service
   - Database: MySQL service
   - Frontend: Node.js static service

## 🔧 Configuration Files

### Backend Production Config
File: `backend/src/main/resources/application-production.yml`

```yaml
spring:
  profiles:
    active: production
  datasource:
    url: ${MYSQL_URL}
    username: ${MYSQL_USERNAME}
    password: ${MYSQL_ROOT_PASSWORD}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS}
```

### Frontend Environment
File: `frontend/.env.production`

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
GENERATE_SOURCEMAP=false
```

## 🏗️ Architecture Overview

```
[Frontend - Vercel]
       ↓ HTTPS
[Load Balancer]
       ↓
[Backend API - Render]
       ↓
[MySQL Database - Render/PlanetScale]
       ↓
[Shopify APIs]
```

## 📊 Monitoring & Health Checks

### Backend Health Check
```
GET https://your-backend.onrender.com/api/actuator/health
```

### Frontend Health Check
```
GET https://your-frontend.vercel.app/
```

### Database Connection
```bash
# Test database connection
curl -X GET "https://your-backend.onrender.com/api/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Security Considerations

1. **HTTPS Only**: All endpoints use HTTPS in production
2. **CORS Policy**: Restrict to specific domains
3. **Environment Variables**: Never commit secrets
4. **JWT Tokens**: Use strong, long secrets (64+ characters)
5. **Database**: Use connection pooling and SSL

## 📈 Scaling Considerations

### Backend Scaling
- **Horizontal**: Multiple Render instances
- **Vertical**: Upgrade instance types
- **Database**: Read replicas for analytics

### Frontend Scaling
- **CDN**: Vercel Edge Network
- **Caching**: Static asset optimization
- **Code Splitting**: Lazy loading

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   ```yaml
   # Update backend application-production.yml
   cors:
     allowed-origins: https://your-actual-frontend-domain.com
   ```

2. **Database Connection Failures**:
   ```bash
   # Check environment variables
   echo $MYSQL_URL
   # Test connection
   curl -X GET "/actuator/health"
   ```

3. **Build Failures**:
   ```bash
   # Backend
   mvn clean install -DskipTests -X
   
   # Frontend
   npm run build --verbose
   ```

4. **Memory Issues**:
   ```bash
   # Increase Java heap size
   java -Xmx512m -jar target/shopify-service-1.0.0.jar
   ```

### Logs and Debugging

1. **Backend Logs**:
   ```bash
   # Render logs
   tail -f /var/log/app.log
   ```

2. **Frontend Logs**:
   ```bash
   # Vercel deployment logs
   vercel logs your-deployment-url
   ```

## 🚦 Production Checklist

- [ ] Repository is public on GitHub
- [ ] All environment variables are set
- [ ] Database schema is created and seeded
- [ ] CORS is configured for production domains
- [ ] JWT secret is secure (64+ characters)
- [ ] Health checks are responding
- [ ] HTTPS is enforced
- [ ] Error tracking is enabled
- [ ] Logging is configured
- [ ] Database backups are scheduled

## 📞 Support

For deployment issues:

1. **Check Logs**: Always check application logs first
2. **Health Endpoints**: Use `/actuator/health` for backend status
3. **Environment Variables**: Verify all required env vars are set
4. **Database**: Ensure database is accessible and seeded

## 🎯 Performance Optimization

### Backend Optimizations
```yaml
# Production settings
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Don't auto-create in production
    show-sql: false       # Disable SQL logging
server:
  compression:
    enabled: true         # Enable gzip compression
```

### Frontend Optimizations
```json
{
  "build": {
    "env": {
      "GENERATE_SOURCEMAP": "false",
      "REACT_APP_ENV": "production"
    }
  }
}
```

This deployment guide ensures your Xeno FDE assignment is production-ready and deployed successfully to cloud platforms.

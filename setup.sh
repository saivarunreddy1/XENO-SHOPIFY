#!/bin/bash

# Xeno FDE Assignment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Xeno FDE Assignment - Shopify Analytics Dashboard"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required but not installed. Please install Docker Desktop."
        exit 1
    fi
    print_status "Docker found"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is required but not installed."
        exit 1
    fi
    print_status "Docker Compose found"

    # Check Java (optional, for local development)
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "?(1\.)?\K\d+')
        if [[ $JAVA_VERSION -ge 17 ]]; then
            print_status "Java 17+ found"
        else
            print_warning "Java 17+ recommended for local development"
        fi
    else
        print_warning "Java not found. Docker will be used for backend."
    fi

    # Check Node.js (optional, for local development)
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | grep -oP 'v\K\d+')
        if [[ $NODE_VERSION -ge 18 ]]; then
            print_status "Node.js 18+ found"
        else
            print_warning "Node.js 18+ recommended for local development"
        fi
    else
        print_warning "Node.js not found. Docker will be used for frontend."
    fi

    echo ""
}

# Setup environment variables
setup_environment() {
    echo "Setting up environment variables..."
    
    if [[ ! -f .env ]]; then
        cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=xeno_shopify
MYSQL_USER=xeno_user
MYSQL_PASSWORD=xeno_password

# Backend Configuration
SPRING_PROFILES_ACTIVE=docker
JWT_SECRET=xeno-shopify-secret-key-2025-internship-assignment-docker

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=docker
EOF
        print_status "Environment file created"
    else
        print_warning "Environment file already exists"
    fi

    # Backend environment
    if [[ ! -f backend/.env ]]; then
        cat > backend/.env << EOF
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/xeno_shopify?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=xeno-shopify-secret-key-2025-internship-assignment
EOF
        print_status "Backend environment file created"
    fi

    # Frontend environment
    if [[ ! -f frontend/.env ]]; then
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
EOF
        print_status "Frontend environment file created"
    fi

    echo ""
}

# Setup database
setup_database() {
    echo "Setting up MySQL database..."
    
    # Start MySQL container
    docker-compose up -d mysql
    
    # Wait for MySQL to be ready
    print_info "Waiting for MySQL to be ready..."
    sleep 30
    
    # Check if MySQL is running
    if docker-compose exec mysql mysqladmin ping -h localhost -u root -ppassword &> /dev/null; then
        print_status "MySQL is running and ready"
    else
        print_error "Failed to start MySQL"
        exit 1
    fi

    echo ""
}

# Build and start services
start_services() {
    echo "Building and starting all services..."
    
    # Build and start all services
    docker-compose up --build -d
    
    print_info "Waiting for services to start..."
    sleep 45
    
    # Check service health
    check_service_health
    
    echo ""
}

# Check service health
check_service_health() {
    echo "Checking service health..."
    
    # Check MySQL
    if docker-compose exec mysql mysqladmin ping -h localhost -u root -ppassword &> /dev/null; then
        print_status "MySQL is healthy"
    else
        print_error "MySQL is not healthy"
    fi
    
    # Check Backend
    if curl -f http://localhost:8080/api/actuator/health &> /dev/null; then
        print_status "Backend is healthy"
    else
        print_warning "Backend health check failed (this may be normal during startup)"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_status "Frontend is accessible"
    else
        print_warning "Frontend may still be starting up"
    fi
    
    echo ""
}

# Setup local development
setup_local_dev() {
    echo "Setting up local development environment..."
    
    # Backend setup
    if command -v java &> /dev/null && command -v mvn &> /dev/null; then
        echo "Setting up backend for local development..."
        cd backend
        if [[ ! -d "target" ]]; then
            mvn clean install -DskipTests
            print_status "Backend dependencies installed"
        fi
        cd ..
    fi
    
    # Frontend setup
    if command -v npm &> /dev/null; then
        echo "Setting up frontend for local development..."
        cd frontend
        if [[ ! -d "node_modules" ]]; then
            npm install
            print_status "Frontend dependencies installed"
        fi
        cd ..
    fi
    
    echo ""
}

# Display setup complete message
display_completion() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "================="
    echo ""
    print_info "Services are starting up. Please wait a few minutes for all services to be fully ready."
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend Dashboard: http://localhost:3000"
    echo "   Backend API:        http://localhost:8080/api"
    echo "   API Documentation:  http://localhost:8080/swagger-ui.html"
    echo "   Database:           localhost:3306"
    echo ""
    echo "🔑 Demo Credentials:"
    echo "   Email:    admin@demo-fashion.com"
    echo "   Password: password123"
    echo ""
    echo "📚 Quick Commands:"
    echo "   View logs:          docker-compose logs -f"
    echo "   Stop services:      docker-compose down"
    echo "   Restart services:   docker-compose restart"
    echo "   Reset data:         docker-compose down -v && ./setup.sh"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Wait 2-3 minutes for all services to fully start"
    echo "   2. Visit http://localhost:3000 to access the dashboard"
    echo "   3. Login with the demo credentials above"
    echo "   4. Explore the multi-tenant Shopify analytics features"
    echo ""
    print_status "Happy coding! 🚀"
}

# Main setup flow
main() {
    check_prerequisites
    setup_environment
    setup_database
    setup_local_dev
    start_services
    display_completion
}

# Run main function
main "$@"

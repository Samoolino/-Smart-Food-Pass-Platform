#!/bin/bash

# Smart Food Pass Platform - Quick Setup Script

echo "🚀 Smart Food Pass Platform - Setup Guide"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Database setup
echo "📦 Setting up PostgreSQL..."
echo "Run this command to create the database:"
echo ""
echo "  createdb -U postgres smart_food_pass"
echo ""
echo "Then run:"
echo "  psql -U app_user -d smart_food_pass < backend/src/database/schema.sql"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd backend
cp .env.example .env
npm install
echo "✅ Backend dependencies installed"
echo ""

# Frontend setup
echo "🎨 Setting up Frontend..."
cd ../frontend
cp .env.local.example .env.local
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Contracts setup
echo "🔐 Setting up Smart Contracts..."
cd ../contracts
cp .env.example .env
npm install
npx hardhat compile
echo "✅ Contracts compiled"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Start PostgreSQL:"
echo "   psql -U postgres"
echo "   CREATE DATABASE smart_food_pass;"
echo "   CREATE USER app_user WITH PASSWORD 'password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE smart_food_pass TO app_user;"
echo ""
echo "2. Initialize database schema:"
echo "   cd backend"
echo "   npm run db:migrate"
echo ""
echo "3. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run start:dev"
echo ""
echo "4. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Deploy Smart Contract (Terminal 3):"
echo "   cd contracts"
echo "   npx hardhat run scripts/deploy.ts --network mumbai"
echo ""
echo "6. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo ""
echo "✨ Happy Building!"

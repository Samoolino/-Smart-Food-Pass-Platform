# Smart Food Pass Platform - MVP Setup & Launch Guide

## ✨ Workspace Setup Complete!

Your complete Smart Food Pass MVP workspace is ready for development. This guide covers installation, configuration, and launch procedures.

---

## 📂 Project Structure

```
smart-food-pass/
├── docs/                           # Project documentation (5 core docs)
│   ├── 01-startup-one-pager.md     # Positioning & market
│   ├── 02-mvp-requirements.md      # Features, APIs, workflows
│   ├── 03-technical-architecture.md # System design
│   ├── 04-developer-scope-brief.md # Sprint roadmap
│   └── 05-venture-narrative.md     # Market thesis & competitive edge
│
├── backend/                        # NestJS API (localhost:3001)
│   ├── src/
│   │   ├── main.ts                 # Entry point
│   │   ├── app.module.ts           # Root module
│   │   ├── auth/                   # Authentication module
│   │   ├── users/                  # User management
│   │   ├── passes/                 # Pass creation & management
│   │   ├── merchants/              # Merchant validation
│   │   ├── products/               # Product database
│   │   ├── sponsors/               # Sponsor dashboards
│   │   ├── analytics/              # Reporting engine
│   │   ├── blockchain/             # Smart contract bridge
│   │   └── database/               # Schema + migrations
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── .env.example                # Environment template
│   └── nest-cli.json               # NestJS CLI config
│
├── frontend/                       # Next.js Dashboard (localhost:3000)
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── beneficiary/            # Beneficiary dashboard
│   │   ├── sponsor/                # Sponsor dashboard
│   │   ├── merchant/               # Merchant interface
│   │   └── admin/                  # Admin console
│   ├── components/                 # Reusable components
│   ├── hooks/                      # Custom React hooks
│   ├── styles/                     # Tailwind + CSS
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── .env.local.example
│
├── contracts/                      # Solidity Smart Contracts
│   ├── contracts/
│   │   ├── SmartFoodPass.sol       # Core contract (500+ lines)
│   │   └── interfaces/
│   ├── test/
│   │   └── SmartFoodPass.test.ts   # Contract tests
│   ├── scripts/
│   │   ├── deploy.ts               # Deployment script
│   │   └── verify.ts               # Verification script
│   ├── hardhat.config.ts           # Hardhat configuration
│   └── package.json
│
├── .github/
│   └── copilot-instructions.md     # Development instructions
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Root documentation
└── SETUP.sh                        # Quick setup script
```

---

## 🔧 Installation Steps

### **Step 1: Prerequisites**

Ensure you have installed:
- **Node.js 18+** ([https://nodejs.org](https://nodejs.org))
- **PostgreSQL 14+** ([https://www.postgresql.org](https://www.postgresql.org))
- **Git** ([https://git-scm.com](https://git-scm.com))
- **npm** or **yarn** (comes with Node.js)

### **Step 2: Database Setup**

Open terminal and run:

```bash
# Create database and user
psql -U postgres

postgres=# CREATE DATABASE smart_food_pass;
postgres=# CREATE USER app_user WITH PASSWORD 'password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE smart_food_pass TO app_user;
postgres=# \q

# Load schema
cd backend
psql -U app_user -d smart_food_pass -f src/database/schema.sql
```

### **Step 3: Backend Setup**

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run start:dev
```

**Expected output:**
```
[NestFactory] Starting Nest application...
Smart Food Pass Backend running on http://localhost:3001/api
```

### **Step 4: Frontend Setup**

Open new terminal:

```bash
cd frontend

# Copy environment file
cp .env.local.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### **Step 5: Smart Contracts Setup**

Open third terminal:

```bash
cd contracts

# Copy environment file
cp .env.example .env
# Edit .env and add ADMIN_PRIVATE_KEY (get from MetaMask or another wallet)

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network mumbai
```

---

## 🚀 Running the Application

### **Terminal 1: Backend**
```bash
cd backend
npm run start:dev
# Runs on: http://localhost:3001/api
# Health check: curl http://localhost:3001/api/health
```

### **Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# Runs on: http://localhost:3000
# Login page: http://localhost:3000/auth/login
```

### **Terminal 3: Smart Contracts**
```bash
cd contracts
# Deploy contracts
npx hardhat run scripts/deploy.ts --network mumbai

# Run tests
npx hardhat test

# Check contract on explorer
# https://mumbai.polygonscan.com/address/0x<CONTRACT_ADDRESS>
```

---

## 📋 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:3000 | User dashboards |
| **Login Page** | http://localhost:3000/auth/login | User login |
| **API Health** | http://localhost:3001/api/health | Backend status |
| **API Docs** | http://localhost:3001/api/docs | Swagger docs (when implemented) |
| **Polygon Explorer** | https://mumbai.polygonscan.com | View transactions |

---

## 🔑 Test Credentials

### Database
```
Host: localhost
Port: 5432
Database: smart_food_pass
Username: app_user
Password: password
```

### Smart Contract Network
```
Network: Polygon Mumbai (Testnet)
Chain ID: 80001
RPC: https://rpc-mumbai.maticvigil.com
Faucet: https://faucet.polygon.technology/
```

### Test Account (for blockchain)
- Use MetaMask or Hardhat test accounts
- Get Mumbai testnet MATIC from faucet

---

## 📚 Core Documents

### 1. **Startup One-Pager** (`docs/01-startup-one-pager.md`)
- Product positioning
- Market opportunity
- Competitive edge
- Business model
- Financial projections

**When to read:** Investor pitches, stakeholder updates

### 2. **MVP Requirements** (`docs/02-mvp-requirements.md`)
- User roles & permissions
- Feature list by module
- API endpoints (25+)
- Database schema (10 tables)
- Success metrics

**When to read:** Feature implementation, QA planning

### 3. **Technical Architecture** (`docs/03-technical-architecture.md`)
- System design diagrams
- Technology decisions
- API flow patterns
- Security architecture
- Deployment strategy

**When to read:** System design reviews, technical decisions

### 4. **Developer Scope Brief** (`docs/04-developer-scope-brief.md`)
- What to build first (MVP essentials)
- What NOT to build (Phase 2+)
- Sprint breakdown (Week 1 & 2)
- Deliverables & acceptance criteria
- Team roles

**When to read:** Sprint planning, task assignments

### 5. **Venture Narrative** (`docs/05-venture-narrative.md`)
- Market thesis
- Why now (inflection point)
- Competitive positioning
- Why we win
- Funding & scale roadmap

**When to read:** Fundraising, market positioning

---

## 🛠️ Common Development Commands

### Backend

```bash
# Development
npm run start:dev              # Start with auto-reload
npm run build                  # Build for production
npm run start:prod             # Run production build

# Database
npm run db:migrate             # Run migrations
npm run db:revert              # Rollback migrations
npm run db:seed                # Load seed data

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Generate coverage report

# Code quality
npm run lint                   # Run ESLint
npm run format                 # Format with Prettier
```

### Frontend

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Serve production build

# Code quality
npm run lint                   # Run ESLint
npm run format                 # Format with Prettier
npm run type-check             # Check TypeScript
```

### Smart Contracts

```bash
# Compilation & Deployment
npx hardhat compile            # Compile contracts
npx hardhat deploy:local       # Deploy locally (Hardhat)
npx hardhat deploy:mumbai      # Deploy to Mumbai testnet

# Testing
npx hardhat test               # Run contract tests
npx hardhat test:gas           # Run with gas reporting

# Verification
npx hardhat verify <address> --network mumbai
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test                  # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
```

### Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat test --grep "Pass Management"
```

### Manual Testing Checklist

**Authentication**
- [ ] Signup creates user in database
- [ ] Login returns JWT token
- [ ] Password reset works
- [ ] Logout clears session

**Pass Issuance**
- [ ] Sponsor can create pass
- [ ] QR code generates
- [ ] Beneficiary receives notification
- [ ] Pass stored in database

**Redemption**
- [ ] Merchant can scan QR
- [ ] Pass validates (not expired, amount available)
- [ ] Balance updates correctly
- [ ] Transaction logged

**Analytics**
- [ ] Dashboard metrics load
- [ ] Filters work (date range, beneficiary)
- [ ] Export to CSV works
- [ ] Metrics are accurate

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Environment variables set correctly (no secrets in code)
- [ ] HTTPS enabled on all endpoints
- [ ] JWT token expiry set (24h)
- [ ] Password hashing enabled (bcrypt 10 rounds)
- [ ] Rate limiting configured (100 req/min)
- [ ] CORS restricted to frontend domain
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation on all endpoints
- [ ] Audit logging enabled
- [ ] Database backups configured
- [ ] Error messages don't expose sensitive data
- [ ] Smart contract audited (if mainnet)

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check database connection
psql -U app_user -d smart_food_pass -c "SELECT 1"

# Verify .env file exists and is correct
cat backend/.env
```

### Frontend build fails
```bash
# Clear cache and reinstall
rm -rf frontend/node_modules frontend/.next
cd frontend
npm install
npm run build
```

### Contract deployment fails
```bash
# Check account balance (need Mumbai testnet MATIC)
npx hardhat run scripts/deploy.ts --network hardhat

# Verify RPC endpoint is working
curl https://rpc-mumbai.maticvigil.com
```

### Database issues
```bash
# Reset database (DEV ONLY!)
dropdb -U postgres smart_food_pass
createdb -U postgres smart_food_pass
psql -U app_user -d smart_food_pass < backend/src/database/schema.sql
```

---

## 📈 Sprint Timeline

### Week 1: Core Infrastructure (Modules 1-4)
- **Day 1-2**: Auth + User profiles
- **Day 3-4**: Pass issuance + QR generation
- **Day 5**: Merchant redemption + integration testing
- **Deliverable**: Clickable MVP demo

### Week 2: Intelligence & Reporting (Modules 5-8)
- **Day 6-7**: Product database + Sponsor dashboard
- **Day 8**: Admin controls + User management
- **Day 9**: Smart contract integration
- **Day 10**: Full E2E testing + Demo prep
- **Deliverable**: Venture-demo-ready MVP

---

## 📞 Support & Resources

### Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Solidity Docs](https://docs.soliditylang.org)
- [Hardhat Docs](https://hardhat.org/docs)
- [TypeORM Docs](https://typeorm.io)

### Community
- Smart Food Pass Team: dev@smartfoodpass.com
- GitHub Issues: Report bugs and request features

### Tools
- **VS Code Extensions**:
  - Solidity (Juan Blanco)
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code Formatter
  - ESLint

---

## 🎯 Next Steps

1. **Review Documentation** (30 mins)
   - Read all 5 core documents
   - Understand project vision & scope

2. **Setup Local Environment** (1 hour)
   - Install prerequisites
   - Setup database
   - Install dependencies

3. **Run Application** (30 mins)
   - Start backend, frontend, contracts
   - Verify all services running
   - Test health endpoints

4. **Explore Codebase** (2 hours)
   - Review module structure
   - Understand file organization
   - Check existing scaffolding

5. **Start Development** (Begin Sprint)
   - Pick first task from scope brief
   - Create feature branch
   - Implement module
   - Submit PR

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend health check responds: `curl http://localhost:3001/api/health`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Database connected: `psql -U app_user -d smart_food_pass -c "SELECT 1"`
- [ ] Smart contract compiles: `npx hardhat compile`
- [ ] All npm dependencies installed (no errors)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] ESLint passes: `npm run lint`

---

## 🎉 Ready to Build!

Your Smart Food Pass MVP workspace is complete and ready for development. All scaffolding, documentation, and configuration files are in place.

**Start building immediately with:**
```bash
cd backend && npm run start:dev  # Terminal 1
cd frontend && npm run dev       # Terminal 2 (new)
cd contracts && npm run test     # Terminal 3 (new)
```

**Questions?** Refer to the 5 core documents or the troubleshooting section.

---

**Smart Food Pass Platform MVP**  
*2-Week Development Sprint - Ready to Go! 🚀*

Last Updated: April 19, 2026

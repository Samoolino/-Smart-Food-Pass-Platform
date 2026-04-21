# Smart Food Pass Platform

**Programmable Grocery Access & Nutrition Intelligence Infrastructure**

A blockchain-ready, fintech-enabled platform that enables sponsored grocery access through reusable QR-enabled passes, with nutrition intelligence, verified product data, and merchant payment integration.

## Project Status
- **Stage**: MVP Development (2-Week Sprint)
- **Launch Date**: Week 2 of implementation
- **Market Focus**: Institutional donors, municipal welfare systems, CSR programs, retail partnerships

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/smart-food-pass.git
cd smart-food-pass

# Backend setup
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run start:dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Contracts setup (new terminal)
cd contracts
npm install
npx hardhat compile
```

### Access
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Admin Dashboard: `http://localhost:3000/admin`

## Documentation

- **[Startup One-Pager](docs/01-startup-one-pager.md)** — Product positioning & market overview
- **[MVP Requirements](docs/02-mvp-requirements.md)** — Feature list, APIs, workflows
- **[Technical Architecture](docs/03-technical-architecture.md)** — System design & stack
- **[Developer Scope Brief](docs/04-developer-scope-brief.md)** — Sprint modules & delivery
- **[Venture Narrative](docs/05-venture-narrative.md)** — Market thesis & competitive edge
- **[Developer Requirements Document (DRD)](docs/06-developer-requirements-document.md)** — Full onboarding and implementation requirements

## Project Structure

```
smart-food-pass/
├── backend/              # Node.js/NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication & RBAC
│   │   ├── passes/      # Pass issuance & management
│   │   ├── merchants/   # Merchant validation
│   │   ├── products/    # Product database & lookup
│   │   ├── sponsors/    # Sponsor dashboards
│   │   ├── analytics/   # Reporting engine
│   │   ├── blockchain/  # Smart contract integration
│   │   └── database/    # Schema & migrations
│   └── package.json
│
├── frontend/             # Next.js dashboard
│   ├── app/
│   │   ├── auth/        # Login/Signup
│   │   ├── beneficiary/ # User dashboard
│   │   ├── sponsor/     # Sponsor dashboard
│   │   ├── merchant/    # Merchant interface
│   │   └── admin/       # Admin controls
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   └── package.json
│
├── contracts/           # Solidity smart contracts
│   ├── contracts/SmartFoodPass.sol
│   ├── test/
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
│
└── docs/               # Project documentation
```

## Core Features (MVP)

### Phase 0 (Week 1)
- ✅ User authentication & role-based access
- ✅ Personal & household profiles
- ✅ Pass creation & QR generation
- ✅ Merchant validation & redemption
- ✅ Basic transaction logging

### Phase 1 (Week 2)
- ✅ Product intelligence database
- ✅ Sponsor funding dashboard
- ✅ Admin controls & user management
- ✅ Analytics & reporting
- ✅ Smart contract deployment (testnet)

## Technology Stack

| Component | Technology |
|-----------|-------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, ShadcnUI |
| **Backend** | Node.js, NestJS, PostgreSQL |
| **Smart Contracts** | Solidity, Hardhat, OpenZeppelin |
| **QR Service** | QRCode (server-side generation) |
| **Blockchain** | Polygon Mumbai (testnet) |
| **Auth** | JWT, bcrypt |
| **Hosting** | Vercel (frontend), Cloud (backend) |

## API Overview

### Core Endpoints
```
POST   /api/auth/signup                 # User registration
POST   /api/auth/login                  # User login
GET    /api/passes                      # List user passes
POST   /api/passes/create               # Create pass (sponsor)
POST   /api/passes/redeem               # Redeem pass (merchant)
GET    /api/products                    # Product lookup
GET    /api/analytics/dashboard         # Sponsor analytics
POST   /api/blockchain/fund             # Fund pass on-chain
POST   /api/blockchain/redeem           # Redeem on-chain
```

## Database Schema

**10 Core Tables:**
- `users` — User accounts with roles
- `households` — Family/group profiles
- `sponsors` — Funding organizations
- `merchants` — Approved retailers
- `passes` — Digital vouchers
- `pass_transactions` — Redemption history
- `product_catalog` — Product database
- `nutrition_profiles` — Nutrition metadata
- `merchant_settlements` — Payment tracking
- `audit_logs` — System audit trail

## Smart Contract Functions

```solidity
issuePass(address _beneficiary, uint256 _value)
fundPass(uint256 _passId, uint256 _amount)
redeemPass(uint256 _passId, uint256 _amount)
validateMerchant(address _merchant)
expirePass(uint256 _passId)
logTransaction(uint256 _passId, address _merchant, uint256 _amount)
pauseSystem()
```

## MVP Success Criteria

- ✅ Sponsor can fund a pass
- ✅ User receives QR-enabled pass
- ✅ Merchant can scan and redeem
- ✅ Transaction logged in database
- ✅ Smart contract transaction on testnet
- ✅ Analytics dashboard shows impact metrics
- ✅ Admin can manage users, merchants, products
- ✅ Core use case works end-to-end

## Development Workflow

### Week 1: Core Infrastructure
1. **Module 1**: Auth (login/signup/role-based access)
2. **Module 2**: User Profile (personal/household)
3. **Module 3**: Pass Issuance (create/fund/QR)
4. **Module 4**: Merchant Redemption (scan/validate/approve)

### Week 2: Intelligence & Reporting
5. **Module 5**: Product Database (catalog/nutrition)
6. **Module 6**: Sponsor Dashboard (funding/tracking/export)
7. **Module 7**: Admin Controls (user/merchant/product management)
8. **Module 8**: Analytics (KPIs/charts/reporting)

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_food_pass
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
POLYGON_RPC=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=80001
```

## Testing

```bash
# Backend tests
cd backend
npm run test

# Contract tests
cd contracts
npx hardhat test

# E2E tests
cd frontend
npm run test:e2e
```

## Deployment

### Staging
```bash
# Backend: Docker + Cloud Run / AWS Lambda
# Frontend: Vercel
# Database: Managed PostgreSQL
# Contract: Deploy to Polygon Mumbai testnet
```

### Production (Post-MVP)
```bash
# Same architecture
# Contract: Deploy to Polygon mainnet or Arbitrum
# Database: Replicated PostgreSQL with backup
```

## Team Roles

- **Beneficiary/Consumer** — Grocery access user
- **Sponsor/Donor** — CSR/welfare funder
- **Merchant** — Approved retailer/store
- **Admin** — System administrator
- **Super Admin** — Platform operator

## Market Focus

**Primary Markets (MVP):**
- Municipal welfare systems
- Institutional CSR programs
- Diaspora remittance corridors
- NGO food access programs

**Secondary Markets (Phase 2):**
- Retail loyalty programs
- Government food distribution
- Corporate employee benefits
- International aid coordination

## Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| **MVP** | Weeks 1-2 | Core flow, testnet contract |
| **Phase 2** | Weeks 3-8 | Biometrics, advanced AI, mainnet |
| **Phase 3** | Weeks 9-16 | Multi-country, public token utility |
| **Phase 4** | Weeks 17+ | Global scaling, compliance engine |

## Contributing

1. Create feature branch: `git checkout -b feature/module-name`
2. Commit changes: `git commit -am 'Add module feature'`
3. Push branch: `git push origin feature/module-name`
4. Submit pull request

## License

[MIT License](LICENSE)

## Support & Contact

- **Email**: dev@smartfoodpass.com
- **Discord**: [Community Server](https://discord.gg/smartfoodpass)
- **Docs**: [Full Documentation](docs/)

---

**Smart Food Pass Platform** | Infrastructure for the Future of Grocery Access

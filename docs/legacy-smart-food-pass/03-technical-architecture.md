# Technical Architecture Document - Smart Food Pass Platform

**Version**: 1.0  
**Date**: April 19, 2026  
**Target**: MVP Launch (Week 2)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                              │
│  Next.js Frontend (React 18) - Role-Based Dashboards          │
│  • Beneficiary UI    • Merchant UI    • Sponsor UI  • Admin UI │
│  (localhost:3000 / Vercel Production)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS / REST API
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER                                  │
│   NestJS Backend (Node.js) - Express with Routing & Guards     │
│   • Authentication    • Pass Management    • Product DB         │
│   • Analytics         • Blockchain Bridge  • Admin Controls     │
│   (localhost:3001 / Cloud Run / Lambda)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │ SQL Queries + Events
                     ▼
┌──────────────────────────────────┬──────────────────────────────┐
│   DATABASE LAYER                 │  BLOCKCHAIN LAYER            │
│  PostgreSQL 14+                  │  Solidity Smart Contract     │
│  • 10 Core Tables                │  • Pass Issuance             │
│  • Transaction History           │  • Fund/Redeem Logic        │
│  • User Profiles                 │  • Merchant Validation       │
│  • Audit Logs                    │  • Event Logging             │
│  (Managed DB / Self-Hosted)      │  (Polygon Mumbai Testnet)    │
└──────────────────────────────────┴──────────────────────────────┘
```

---

## Component Architecture

### 1. Frontend Layer (Next.js)

**Stack**:
- Framework: Next.js 14 (App Router)
- Runtime: Node.js 18+
- Styling: Tailwind CSS 3+
- UI Library: ShadcnUI
- State Management: React Context API / Zustand
- HTTP Client: Axios / Fetch API
- Auth Storage: Secure HTTP-only cookies (JWT)

**Directory Structure**:
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── auth/
│   │   ├── signup/page.tsx      # Signup form
│   │   ├── login/page.tsx       # Login form
│   │   └── reset-password/      # Password reset
│   ├── beneficiary/
│   │   ├── dashboard/           # Beneficiary dashboard
│   │   ├── passes/              # View passes
│   │   └── history/             # Transaction history
│   ├── sponsor/
│   │   ├── dashboard/           # Sponsor overview
│   │   ├── create-pass/         # Pass creation form
│   │   ├── beneficiaries/       # Manage beneficiaries
│   │   └── analytics/           # Analytics & reports
│   ├── merchant/
│   │   ├── dashboard/           # Merchant home
│   │   ├── redeem/              # QR scanning interface
│   │   └── transactions/        # Daily log
│   └── admin/
│       ├── dashboard/           # Admin overview
│       ├── users/               # User management
│       ├── merchants/           # Merchant management
│       ├── products/            # Product catalog
│       ├── rules/               # Rule configuration
│       └── audit-logs/          # Audit trail
│
├── components/
│   ├── layouts/                 # Page layouts
│   ├── forms/                   # Reusable forms
│   ├── tables/                  # Data tables
│   ├── modals/                  # Modal dialogs
│   ├── cards/                   # Card components
│   └── common/                  # Shared components
│
├── hooks/
│   ├── useAuth.ts              # Auth context hook
│   ├── useApi.ts               # API client hook
│   ├── usePasses.ts            # Passes logic
│   └── useAnalytics.ts         # Analytics logic
│
├── styles/
│   ├── globals.css             # Global styles
│   └── variables.css           # CSS variables
│
├── lib/
│   ├── api-client.ts           # Axios instance
│   ├── auth-utils.ts           # Auth helpers
│   └── validators.ts           # Form validation
│
├── middleware.ts               # Auth middleware
├── package.json
└── next.config.js
```

**Key Libraries**:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.4.0",
    "zustand": "^4.3.0",
    "@shadcn/ui": "latest",
    "tailwindcss": "^3.3.0",
    "react-qr-code": "^1.5.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.40.0",
    "prettier": "^3.0.0"
  }
}
```

---

### 2. Backend Layer (NestJS)

**Stack**:
- Framework: NestJS 10+ (Express.js under the hood)
- Runtime: Node.js 18+
- Language: TypeScript
- ORM: TypeORM
- Database: PostgreSQL 14+
- Auth: JWT + bcrypt
- Validation: class-validator

**Directory Structure**:
```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts    # JWT authentication
│   │   │   └── role.guard.ts   # Role-based authorization
│   │   ├── decorators/
│   │   │   ├── user.decorator.ts   # Extract user from req
│   │   │   └── roles.decorator.ts  # Check roles
│   │   ├── interceptors/
│   │   └── middleware/
│   │
│   ├── auth/
│   │   ├── auth.service.ts     # Auth logic
│   │   ├── auth.controller.ts  # Auth endpoints
│   │   ├── auth.module.ts      # Auth module
│   │   └── dto/
│   │       ├── signup.dto.ts
│   │       └── login.dto.ts
│   │
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── entities/user.entity.ts
│   │   └── dto/
│   │
│   ├── passes/
│   │   ├── passes.service.ts   # Pass creation/management
│   │   ├── passes.controller.ts
│   │   ├── passes.module.ts
│   │   ├── entities/pass.entity.ts
│   │   ├── qr.service.ts       # QR generation
│   │   └── dto/
│   │       ├── create-pass.dto.ts
│   │       └── redeem-pass.dto.ts
│   │
│   ├── merchants/
│   │   ├── merchants.service.ts
│   │   ├── merchants.controller.ts
│   │   ├── merchants.module.ts
│   │   ├── entities/merchant.entity.ts
│   │   └── dto/
│   │
│   ├── products/
│   │   ├── products.service.ts # Product DB lookup
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   ├── entities/product.entity.ts
│   │   └── dto/
│   │
│   ├── sponsors/
│   │   ├── sponsors.service.ts
│   │   ├── sponsors.controller.ts
│   │   ├── sponsors.module.ts
│   │   ├── entities/sponsor.entity.ts
│   │   └── dto/
│   │
│   ├── analytics/
│   │   ├── analytics.service.ts # Analytics queries
│   │   ├── analytics.controller.ts
│   │   ├── analytics.module.ts
│   │   └── dto/
│   │
│   ├── blockchain/
│   │   ├── blockchain.service.ts # Contract integration
│   │   ├── blockchain.controller.ts
│   │   ├── blockchain.module.ts
│   │   └── contract-abi.json
│   │
│   ├── database/
│   │   ├── typeorm.config.ts   # Database connection
│   │   ├── migrations/
│   │   │   ├── 1713619200-init-tables.ts
│   │   │   └── ...
│   │   └── seeders/
│   │       └── seed.ts
│   │
│   └── app.module.ts           # Root module
│
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

**Key Libraries**:
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0",
    "typeorm": "^0.3.0",
    "pg": "^8.10.0",
    "qrcode": "^1.5.0",
    "ethers": "^6.7.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

---

### 3. Database Layer (PostgreSQL)

**Database Configuration**:
```
Host: localhost (dev) / Cloud (prod)
Port: 5432
Database: smart_food_pass
User: app_user
Pool Size: 20 connections
SSL: Enabled (prod)
```

**Core Tables** (10 tables):
1. `users` — User accounts with roles
2. `households` — Family/group profiles
3. `household_members` — Family member details
4. `sponsors` — Funding organizations
5. `merchants` — Approved retailers
6. `passes` — Digital vouchers
7. `pass_transactions` — Redemption history
8. `product_catalog` — Product database
9. `nutrition_profiles` — Nutrition metadata
10. `audit_logs` — System audit trail

**Additional Tables**:
- `merchant_settlements` — Payment tracking
- `system_rules` — Configuration table
- `refresh_tokens` — Token management

**Indexes**:
```sql
CREATE INDEX idx_passes_beneficiary ON passes(beneficiary_id);
CREATE INDEX idx_passes_sponsor ON passes(sponsor_id);
CREATE INDEX idx_transactions_pass ON pass_transactions(pass_id);
CREATE INDEX idx_transactions_merchant ON pass_transactions(merchant_id);
CREATE INDEX idx_transactions_timestamp ON pass_transactions(transaction_timestamp);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 4. Blockchain Layer (Smart Contracts)

**Network**: Polygon Mumbai (testnet)  
**Language**: Solidity 0.8.19+  
**Framework**: Hardhat

**Contract Structure**:
```
contracts/
├── contracts/
│   ├── SmartFoodPass.sol       # Main contract
│   ├── AccessControl.sol       # Role management (OpenZeppelin)
│   └── interfaces/
│       └── ISmartFoodPass.sol  # Contract interface
│
├── test/
│   ├── SmartFoodPass.test.ts   # Contract tests
│   ├── fixtures/
│   └── helpers/
│
├── scripts/
│   ├── deploy.ts              # Deployment script
│   └── verify.ts              # Contract verification
│
├── hardhat.config.ts          # Configuration
└── package.json
```

**Key Smart Contract Functions**:
```solidity
contract SmartFoodPass is AccessControl {
    // State variables
    mapping(uint256 => Pass) public passes;
    mapping(address => uint256) public merchantTotals;
    
    // Events
    event PassIssued(uint256 indexed passId, address indexed beneficiary, uint256 value);
    event PassFunded(uint256 indexed passId, uint256 amount);
    event PassRedeemed(uint256 indexed passId, address indexed merchant, uint256 amount);
    
    // Functions
    function issuePass(address _beneficiary, uint256 _value) external onlySponsor returns (uint256)
    function fundPass(uint256 _passId, uint256 _amount) external onlySponsor
    function redeemPass(uint256 _passId, uint256 _amount) external onlyMerchant returns (bool)
    function validateMerchant(address _merchant) external onlyAdmin
    function logTransaction(uint256 _passId, address _merchant, uint256 _amount) external
    function getPassBalance(uint256 _passId) external view returns (uint256)
    function pauseSystem() external onlyOwner
}
```

**Deployment Details**:
```
Network: Polygon Mumbai
RPC: https://rpc-mumbai.maticvigil.com
Explorer: https://mumbai.polygonscan.com
Gas Limit: 8,000,000
Chain ID: 80001
```

---

## Data Flow Diagrams

### Pass Creation Flow
```
Sponsor → Backend API → Database → Smart Contract
  │           │           │            │
  └─ Create   └─ Validate └─ Store    └─ Issue Event
    Request     Input      Pass       (PassIssued)
                          Record
                            ↓
                         Send QR to
                       Beneficiary
                       (Email/SMS)
```

### Redemption Flow
```
Merchant       Backend           Database      Smart
(QR Scan)  →   (Validate)    →   (Log Tx)  →  Contract
                │                 │            │
                ├─ Extract ID    ├─ Create    ├─ Redeem
                ├─ Verify Pass     Transaction  Pass
                ├─ Check Balance   Record     ├─ Update
                └─ Check Expiry                  Balance
                                               ├─ Emit
                                                 Event
```

### Analytics Flow
```
Sponsor          Backend           Database      Response
(Dashboard)  →   (Query)       →   (Aggregate) → (Dashboard
  │              │                  │              Metrics)
  ├─ Request    ├─ Fetch          ├─ SUM
    Metrics      Transactions      ├─ COUNT
                ├─ Filter by       ├─ GROUP BY
                  Date, User
                ├─ Aggregate
                  Statistics
                ├─ Format JSON
```

---

## API Communication Patterns

### Authentication Flow
```
1. User Login
   POST /api/auth/login
   {email, password} → JWT Token

2. Authenticated Request
   GET /api/passes
   Headers: Authorization: Bearer {JWT}

3. Token Refresh
   POST /api/auth/refresh
   {refresh_token} → New JWT Token
```

### Error Handling
```json
{
  "statusCode": 400,
  "message": "Pass not found or expired",
  "error": "Bad Request",
  "timestamp": "2026-04-19T10:30:45.123Z"
}
```

---

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: 24-hour expiry, signed with HS256
- **Password Hashing**: bcrypt with 10 salt rounds
- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Frontend domain whitelist only
- **HTTPS/TLS**: 1.2+ on all endpoints

### Data Protection
- **SQL Injection Prevention**: Parameterized queries (TypeORM)
- **XSS Prevention**: Input sanitization + Content-Security-Policy headers
- **CSRF Protection**: Token-based validation
- **Audit Logging**: All sensitive operations logged

### Smart Contract Security
- **OpenZeppelin Libraries**: Proven, audited contracts
- **Access Control**: Role-based function modifiers
- **Reentrancy Guards**: Prevent exploits
- **Overflow/Underflow**: Use SafeMath (Solidity 0.8+)

---

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────┐
│ Developer Machine                   │
├─────────────────────────────────────┤
│ Frontend: localhost:3000            │
│ Backend: localhost:3001             │
│ Database: Local PostgreSQL          │
│ Blockchain: Hardhat (local)         │
└─────────────────────────────────────┘
```

### Staging Environment
```
┌─────────────────────────────────────┐
│ Cloud Infrastructure (Staging)      │
├─────────────────────────────────────┤
│ Frontend: Vercel Preview            │
│ Backend: Cloud Run / Lambda         │
│ Database: Managed PostgreSQL        │
│ Blockchain: Polygon Mumbai Testnet  │
│ CDN: Vercel Edge                    │
└─────────────────────────────────────┘
```

### Production Environment (Post-MVP)
```
┌─────────────────────────────────────┐
│ Cloud Infrastructure (Production)   │
├─────────────────────────────────────┤
│ Frontend: Vercel (CDN)              │
│ Backend: Kubernetes / Cloud Run     │
│ Database: PostgreSQL with Replicas  │
│ Cache: Redis (Phase 2)              │
│ Blockchain: Polygon Mainnet         │
│ Monitoring: DataDog / New Relic     │
└─────────────────────────────────────┘
```

---

## Technology Decision Matrix

| Component | Technology | Why | Alternative |
|-----------|-----------|-----|-------------|
| Frontend | Next.js 14 | SSR, fast, SEO-friendly | React SPA |
| Backend | NestJS | TypeScript, modular, scalable | Express |
| Database | PostgreSQL | Relational, ACID, JSON support | MongoDB |
| Auth | JWT + bcrypt | Stateless, secure | Sessions |
| Blockchain | Solidity/Hardhat | EVM-compatible, testnet available | Rust/Substrate |
| QR | qrcode library | Server-side, no dependency | Third-party API |

---

## Performance Considerations

### Database Optimization
- Connection pooling (20 connections)
- Query optimization (indexes on foreign keys)
- Pagination on list endpoints (limit 20 per page)
- Caching layer (Redis, Phase 2)

### API Performance
- Response time target: <500ms (p95)
- Gzip compression enabled
- CDN for static assets (Vercel)
- Database query caching (30 seconds)

### Frontend Performance
- Next.js incremental static regeneration
- Image optimization (Next.js Image component)
- Code splitting by route
- Lighthouse score target: 90+

---

## Monitoring & Logging

### Application Logging
- **Backend Logs**: Winston logger (JSON format)
- **Frontend Logs**: Browser console + Sentry
- **Smart Contract Events**: Hardhat event emitter

### System Monitoring
- **Uptime**: Monitoring.com / UptimeRobot
- **Performance**: Vercel Analytics / Datadog
- **Database**: PostgreSQL query logs
- **Errors**: Sentry integration

### Alerting
- **Critical Alerts**: Email + Slack
- **Warning Alerts**: Slack only
- **Info Logs**: Dashboard only

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups (7-day retention)
- **Code**: GitHub repository (remote backup)
- **Smart Contract**: ABI + deployment info stored

### Recovery Procedures
- **Database Failure**: Restore from last backup (<1 hour)
- **Service Outage**: Failover to backup instance
- **Smart Contract Issue**: Pause system, investigate, deploy fix

---

## Compliance & Standards

✅ HTTPS/TLS 1.2+  
✅ OWASP Top 10 prevention  
✅ Data encryption at rest (PG native)  
✅ Audit logging (100% coverage)  
✅ PII protection (anonymization in logs)  
✅ GDPR-ready (data deletion implemented)  

---

## Infrastructure as Code (Future)

```yaml
# Example: docker-compose.yml for local development
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://app:pass@db:5432/smart_food_pass
  
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  db:
    image: postgres:14-alpine
    volumes: [db-data:/var/lib/postgresql/data]
```

---

## Technology Roadmap

| Phase | Timeline | Technology Additions |
|-------|----------|---------------------|
| **MVP** | Week 1-2 | Next.js + NestJS + PostgreSQL + Solidity |
| **Phase 2** | Month 3-4 | Redis cache, GraphQL API, Mobile apps |
| **Phase 3** | Month 6-8 | Kubernetes, Microservices, ML models |
| **Phase 4** | Year 2+ | Blockchain layer 2, Advanced analytics |

---

## Architecture Review Checklist

✅ Frontend can communicate with backend API  
✅ Backend can read/write to PostgreSQL  
✅ Smart contract can be deployed to testnet  
✅ QR codes generate server-side  
✅ Auth flow works end-to-end  
✅ Role-based access control implemented  
✅ Logging and monitoring in place  
✅ Error handling graceful  
✅ Performance targets met  
✅ Security standards satisfied  

---

**Smart Food Pass Platform - Technical Architecture**  
*Enterprise-Ready MVP Infrastructure*

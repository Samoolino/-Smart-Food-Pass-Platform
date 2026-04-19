# Developer Scope Brief - Smart Food Pass MVP

**Duration**: 2-Week Sprint (10 working days)  
**Team Size**: 3-4 developers (minimum)  
**Status**: Sprint Planning Complete

---

## What To Build First (MVP Essentials)

### Priority 1: MUST HAVE (Week 1, Days 1-5)

These enable the core use case. Without these, there is no MVP.

#### **Module 1: Authentication** (Days 1-2)
- User signup/login with email
- Role-based access (Beneficiary/Sponsor/Merchant/Admin)
- JWT token generation + refresh
- Password reset flow
- Email verification

**Definition of Done:**
- Signup form works and creates user
- Login works and returns JWT
- Role-based redirects work
- Token refresh works

#### **Module 2: User Profiles** (Days 2-3)
- Beneficiary personal profile (name, age, address)
- Household profile for beneficiaries
- Sponsor organization profile
- Merchant store profile
- Profile completion indicator

**Definition of Done:**
- User can complete profile after signup
- Profile data persists in database
- Dashboard shows profile completion status

#### **Module 3: Pass Issuance** (Days 3-4)
- Sponsor creates digital pass
- Assign value (₹100-₹10K)
- Set validity period (7-90 days)
- Generate unique Pass ID
- Generate QR code (server-side)
- Send QR to beneficiary (email/SMS)

**Definition of Done:**
- Sponsor can create pass
- Pass stored in database
- QR code generated and displayable
- Beneficiary notified

#### **Module 4: Merchant Redemption** (Days 4-5)
- Merchant scans QR code (text input for MVP)
- Validate pass (not expired, amount available)
- Enter redemption amount
- Approve/reject transaction
- Update pass balance
- Show receipt

**Definition of Done:**
- Merchant can scan QR
- Pass validates correctly
- Balance updates
- Transaction logged
- Receipt shown

### Priority 2: ESSENTIAL (Week 2, Days 1-5)

These complete the MVP and enable stakeholder demos.

#### **Module 5: Product Database** (Days 1-2)
- Product catalog with 50+ items
- Categories (Grains, Vegetables, Fruits, Dairy, etc.)
- Nutrition metadata (calories, protein, fat, carbs)
- Compliance flags (organic, fair-trade, local)
- Product search/filter
- Display eligible products during redemption

**Definition of Done:**
- Product catalog populated
- Search works
- Nutrition data visible
- Eligible products filter works

#### **Module 6: Sponsor Dashboard** (Days 2-4)
- Dashboard overview (key metrics)
- Passes issued (count, value, status)
- Redemption analytics (amount, %)
- Top products purchased
- Transaction history (drill-down)
- Beneficiary list
- CSV export

**Definition of Done:**
- Dashboard loads without errors
- All metrics calculate correctly
- Filters work (date range, beneficiary, product)
- Export works

#### **Module 7: Admin Controls** (Days 3-5)
- User management (approve/deactivate)
- Merchant management (approve/commission)
- Product management (add/edit/enable/disable)
- Rule configuration (defaults, limits)
- System controls (pause/resume)
- Audit logs view

**Definition of Done:**
- Admin can manage all entities
- Changes persist and propagate
- Audit log complete

#### **Module 8: Analytics & Smart Contract** (Days 4-5)
- System-wide KPIs (issued, redeemed, active users)
- Deploy contract to testnet
- Integrate contract with backend
- Log transactions to blockchain
- Verify contract transactions on explorer

**Definition of Done:**
- Analytics dashboard shows metrics
- Contract deploys without errors
- Transactions logged to blockchain
- Explorer shows confirmed transactions

---

## What NOT to Build (Phase 2+)

These are explicitly OUT of MVP scope:

❌ **Full Biometrics** — Iris, fingerprint scanning (Phase 2)  
❌ **Advanced AI Engine** — ML-based nutrition recommendations (Phase 2)  
❌ **Public Token Utility** — Complex on-chain economics (Phase 2)  
❌ **Large-Scale Merchant Switching** — Complex POS integrations (Phase 2)  
❌ **Cashback Loops** — Reward mechanics (Phase 2)  
❌ **Multi-Country Compliance** — GDPR, local regulations (Phase 2)  
❌ **Native Mobile Apps** — Flutter/React Native (Phase 2, use web)  
❌ **Advanced Analytics** — Predictive models, forecasting (Phase 3)  
❌ **Direct Bank Integration** — Payment gateway connections (Phase 2)  
❌ **Mainnet Deployment** — Stay on testnet for MVP  

---

## Sprint Modules & Deliverables

### Week 1: Core Infrastructure (Modules 1-4)

```
DAY 1 (Monday)
- Backend: Auth service + JWT setup
- Frontend: Login/signup pages
- Database: Create users table + schema
- Deliverable: Authentication working end-to-end

DAY 2 (Tuesday)
- Backend: User profile service
- Frontend: Profile completion forms
- Database: Add user profiles tables
- Deliverable: Users can complete profiles

DAY 3 (Wednesday)
- Backend: Pass issuance service + QR generation
- Frontend: Sponsor pass creation form
- Database: Create passes table
- Deliverable: Passes can be created and QR generated

DAY 4 (Thursday)
- Backend: Pass validation + redemption service
- Frontend: Merchant redemption interface
- Database: Create transactions table
- Deliverable: Passes can be redeemed

DAY 5 (Friday)
- Integration testing: Full flow (fund → redeem → log)
- Staging deployment
- Demo preparation
- Deliverable: Clickable MVP demo ready
```

### Week 2: Intelligence & Reporting (Modules 5-8)

```
DAY 6 (Monday)
- Backend: Product catalog service
- Frontend: Product database UI
- Database: Create product_catalog table
- Deliverable: Product database searchable

DAY 7 (Tuesday)
- Backend: Analytics service + sponsor dashboard API
- Frontend: Sponsor analytics dashboard
- Database: Analytics queries optimized
- Deliverable: Sponsor can see impact metrics

DAY 8 (Wednesday)
- Backend: Admin management APIs
- Frontend: Admin console
- Deliverable: Admin can manage users/merchants/products

DAY 9 (Thursday)
- Backend: Smart contract integration + deployment
- Blockchain: Deploy contract to Mumbai testnet
- Backend: Bridge API for blockchain calls
- Deliverable: Contract deployed and tested

DAY 10 (Friday)
- Integration: Contract + backend + database
- Testing: Full end-to-end including blockchain
- Deployment: Staging URL ready
- Deliverable: Venture-demo-ready MVP (all 8 modules)
```

---

## Tech Stack (Frozen)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14+ |
| Frontend Build | TypeScript + Tailwind | Latest |
| Backend | NestJS | 10+ |
| Backend Lang | TypeScript | 5+ |
| Database | PostgreSQL | 14+ |
| ORM | TypeORM | 0.3+ |
| Auth | JWT + bcrypt | Standard |
| QR | qrcode (npm) | 1.5+ |
| Blockchain | Solidity | 0.8.19+ |
| Blockchain Framework | Hardhat | Latest |
| Deployment | Vercel + Cloud Run | Latest |

**No framework/library changes mid-sprint.**

---

## Development Deliverables

### Deliverable 1: Staging URL (End of Week 1)

```
✅ Frontend: https://smart-food-pass-staging.vercel.app
✅ Backend API: https://backend-staging.run.app/api
✅ All 4 modules working: Auth, Profile, Pass Issuance, Redemption
✅ Full flow demountable in 5 minutes
✅ Admin can manage test data
```

### Deliverable 2: MVP Production (End of Week 2)

```
✅ All 8 modules integrated
✅ Smart contract deployed to Polygon Mumbai testnet
✅ Sponsor dashboard complete with analytics
✅ Admin console operational
✅ 50+ test merchants + beneficiaries
✅ 100+ test passes created/redeemed
✅ Audit logs capturing all transactions
✅ Documentation complete (README, API docs, architecture)
✅ Code repository with CI/CD (GitHub Actions)
✅ Test coverage: 60%+ unit tests + E2E tests
```

---

## Technical Requirements

### Backend Requirements
- ✅ All 25+ API endpoints working (see MVP Requirements doc)
- ✅ Role-based access control enforced
- ✅ All 10 database tables created with indexes
- ✅ Error handling on all endpoints
- ✅ Audit logging for all sensitive operations
- ✅ Rate limiting (100 req/min per IP)
- ✅ Health check endpoint (`GET /api/health`)

### Frontend Requirements
- ✅ Responsive design (mobile + desktop)
- ✅ All role-based dashboards work
- ✅ Forms validate input
- ✅ Error messages clear and actionable
- ✅ Loading states while fetching
- ✅ Authentication token persists
- ✅ Graceful logout

### Smart Contract Requirements
- ✅ All core functions implemented
- ✅ Deploys without errors
- ✅ Test suite passes (Hardhat)
- ✅ Events emit correctly
- ✅ Gas estimates reasonable
- ✅ Verified on testnet explorer

### Database Requirements
- ✅ Schema matches design doc
- ✅ Migrations run cleanly
- ✅ Seed data available
- ✅ Indexes created
- ✅ Query performance <200ms (p95)

---

## Testing & QA Strategy

### Unit Tests (Backend)
- Services logic: Auth, Pass, Merchant, Product, Analytics
- DTOs validation
- Target: 60%+ coverage

### Integration Tests
- API endpoint flows
- Database integration
- Authentication flows
- Target: 10+ critical path tests

### E2E Tests
- Core use case: Sponsor funds → User redeems → Merchant validates
- Role-based access
- Target: 3-5 happy path tests

### Manual Testing
- QA team: Test all screens, all roles
- Checklist: 50 test cases per module
- Regression: Previous fixes still work

**QA Acceptance Criteria:**
✅ All happy paths work  
✅ Error cases handled  
✅ No crashes  
✅ Reasonable performance  

---

## Code Quality Standards

### Backend Code
```typescript
// Naming: camelCase for variables, PascalCase for classes
// Functions: <30 lines max, single responsibility
// Error handling: Try-catch + logging
// Comments: Self-documenting code + JSDoc for public methods

class PassService {
  async createPass(dto: CreatePassDto): Promise<Pass> {
    // Validate input
    if (!dto.value || dto.value <= 0) {
      throw new BadRequestException('Invalid value');
    }
    
    // Create pass
    const pass = new Pass();
    // ... logic
    
    // Log
    this.logger.log(`Pass created: ${pass.id}`);
    return pass;
  }
}
```

### Frontend Code
```typescript
// Naming: camelCase for variables, PascalCase for components
// Components: Functional + Hooks only
// Styling: Tailwind classes, no inline styles
// Error handling: Try-catch + user-facing messages

export const CreatePassForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      await api.passes.create(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (/* JSX */);
};
```

### Git Workflow
```
Main branch: Production-ready
Staging branch: Deployed to staging
Feature branches: feature/module-name

Commit format: [MODULE] Action description
Example: [PASS] Add QR generation service
```

---

## Sprint Ceremonies & Checkpoints

### Daily Standup (10am)
- What did you complete yesterday?
- What are you doing today?
- Any blockers?

### Mid-Week Check-in (Wednesday)
- All 4 modules completed? YES / NO
- Any risks to Friday deadline?
- Adjust plan if needed

### Week 1 Demo (Friday, 4pm)
- Show 4 modules to stakeholders
- Explain flow: fund → scan → redeem
- Get feedback

### Week 2 Demo (Friday, 4pm)
- Show all 8 modules + analytics
- Show smart contract on testnet
- Demo admin console
- Get venture feedback

### Code Review
- All PRs reviewed before merge
- 2 approvals required for backend
- 1 approval required for frontend

---

## Common Blockers & Solutions

| Blocker | Solution |
|---------|----------|
| Database not connecting | Check .env, PostgreSQL running, credentials |
| Build fails | Clear node_modules, reinstall, check TypeScript |
| Contract deploy fails | Check gas, RPC endpoint, account balance |
| QR not generating | Verify qrcode package, check input data |
| Slow API response | Check database indexes, add pagination |
| Token expired immediately | Check JWT_EXPIRATION setting in .env |
| Frontend can't reach backend | Check CORS, API_URL, server running |

---

## Post-MVP Transition

**When MVP is done (end of Week 2):**
- Archive sprint board
- Create Phase 2 backlog
- Schedule post-mortem (lessons learned)
- Start Phase 2 planning (biometrics, AI, scaling)
- Plan mainnet deployment strategy

---

## Success Metrics (Acceptance Criteria)

**The MVP is DONE when:**

✅ All 8 modules integrated and working  
✅ Core use case: Sponsor funds → User scans QR → Merchant redeems → Analytics updated  
✅ Smart contract deployed to testnet with confirmed transactions  
✅ Sponsor dashboard shows 5+ accurate KPIs  
✅ Admin console can manage users, merchants, products  
✅ 100+ test transactions created and logged  
✅ No critical bugs remaining  
✅ Documentation complete  
✅ Code pushed to GitHub with CI/CD  
✅ Venture demo-ready (no "under construction" placeholders)  

---

## Team Roles & Responsibilities

### Backend Lead
- Owns: Auth, Pass, Merchant, Analytics, Blockchain services
- Creates: API architecture, database schema, smart contract bridge
- Deliverable: 25+ working endpoints

### Frontend Lead
- Owns: All dashboards, forms, QR interface, admin console
- Creates: Responsive UI, role-based routing, state management
- Deliverable: 6+ pages, all roles working

### DevOps / QA
- Owns: Database setup, deployments, testing, monitoring
- Creates: CI/CD pipeline, test suite, staging environment
- Deliverable: Clean deploys, 60%+ test coverage

### Blockchain Engineer
- Owns: Smart contract development, testnet deployment
- Creates: Solidity code, tests, deployment scripts
- Deliverable: Contract on testnet, event logging working

---

## Next Steps (Starting Now)

1. **Today**: Team syncs on this document
2. **Monday (Day 1)**: Kickoff meeting, assign tasks
3. **Monday-Friday**: Execute Week 1 sprint
4. **Friday (Day 5)**: Demo to stakeholders + refinement
5. **Monday-Friday**: Execute Week 2 sprint
6. **Friday (Day 10)**: Final MVP demo + launch

---

**Smart Food Pass Platform - Developer Scope Brief**  
*2-Week MVP Sprint Execution Plan*  
**Ready to Build? Let's Go! 🚀**

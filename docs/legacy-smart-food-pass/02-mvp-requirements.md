# MVP Requirements Document - Smart Food Pass Platform

**Version**: 1.0  
**Date**: April 19, 2026  
**Status**: MVP Implementation Sprint (Week 1-2)

---

## Executive Summary

This document defines the complete MVP requirements for Smart Food Pass Platform, including user roles, workflows, features, screens, APIs, database tables, success metrics, and integration points.

**MVP Objective**: Build a secure, venture-demo-ready MVP that proves the core use case: Sponsor funds a digital pass → Beneficiary scans QR → Merchant redeems → Transaction logged (DB + blockchain) → Sponsor sees analytics.

---

## 1. User Roles & Access Control

### Role Hierarchy

```
Super Admin (Platform Owner)
├── Admin (System Administrator)
├── Sponsor (Funding Organization - CSR/Welfare/NGO)
├── Merchant (Approved Retailer/Store)
└── Beneficiary (End User/Consumer)
```

### Role Permissions Matrix

| Feature | Beneficiary | Merchant | Sponsor | Admin | Super Admin |
|---------|-------------|----------|---------|-------|------------|
| View passes | ✅ | — | ✅ (all) | ✅ | ✅ |
| Create pass | — | — | ✅ | — | ✅ |
| Fund pass | — | — | ✅ | — | ✅ |
| Redeem/scan pass | — | ✅ | — | — | — |
| View transactions | ✅ (own) | ✅ (merchant) | ✅ (sponsored) | ✅ (all) | ✅ |
| View analytics | — | ✅ (merchant) | ✅ (sponsor) | ✅ (all) | ✅ |
| Manage users | — | — | ✅ (beneficiaries) | ✅ (all) | ✅ |
| Manage merchants | — | — | — | ✅ | ✅ |
| Manage products | — | — | — | ✅ | ✅ |
| Set rules/policies | — | — | — | — | ✅ |

### Role Descriptions

| Role | Responsibility | Login Access | Key Actions |
|------|-----------------|--------------|-------------|
| **Beneficiary** | Grocery access user | Mobile web/responsive | View passes, scan QR to get pass info |
| **Merchant** | Approved retailer | Web or tablet | Scan QR to validate pass, approve redemption |
| **Sponsor** | Funding organization (CSR/welfare/NGO) | Web desktop | Create/fund passes, monitor beneficiaries, export reports |
| **Admin** | System administrator | Web desktop | Manage users/merchants/products, configure rules, view all transactions |
| **Super Admin** | Platform operator | Web desktop + API | Full system control, policy setting, system pause/resume |

---

## 2. Core Workflows

### Workflow 1: User Onboarding

```
NEW USER FLOW:
1. User visits signup page
2. Select role (Beneficiary / Sponsor / Merchant)
3. Enter email, password, basic info
4. System sends verification email
5. User confirms email
6. User completes role-specific profile
7. Account activated
8. Dashboard accessible

ROLE-SPECIFIC PROFILES:
- Beneficiary: Personal (name, age, phone), Household (family members, ages)
- Sponsor: Organization (name, registration #), Admin (name, email)
- Merchant: Store (name, address, POS type), Owner (name, phone)
```

### Workflow 2: Pass Funding

```
SPONSOR CREATES PASS:
1. Sponsor logs in → Dashboard
2. Click "Create New Pass"
3. Enter:
   - Beneficiary selector (search by email/phone)
   - Pass value (₹100, ₹500, ₹1000, custom)
   - Validity period (7 days, 30 days, 90 days, custom)
   - Product restrictions (Optional: select allowed categories)
4. System generates:
   - Unique Pass ID (e.g., SFPASS-2026-001234)
   - QR code (SHA256 checksum included for security)
   - Expiration timestamp
5. Beneficiary notified via SMS/email with:
   - Pass ID
   - QR code image
   - Redemption instructions
6. Pass status: ACTIVE in database
7. Sponsor dashboard updated: "1 new pass funded"
```

### Workflow 3: Merchant Redemption

```
MERCHANT SCANS & REDEEMS:
1. Beneficiary arrives at merchant with QR code (phone or print)
2. Merchant opens redemption interface (web/mobile)
3. Merchant taps "Scan QR Code"
4. Camera opens, scans beneficiary's QR
5. System extracts: Pass ID + checksum
6. Backend validates:
   - Pass exists in database
   - Pass not expired
   - Amount > 0
   - Beneficiary account active
   - Merchant approved
7. If valid:
   - Show pass details (balance, validity)
   - Merchant enters amount (e.g., ₹250)
   - System checks: Remaining balance ≥ amount
   - Merchant confirms (taps "Approve")
8. If invalid:
   - Show error (pass expired, insufficient balance, account inactive)
   - Redemption rejected
9. Upon approval:
   - Transaction created in database
   - Pass balance updated (₹500 → ₹250)
   - Blockchain transaction triggered
   - Receipt shown to both parties
   - Merchant sees transaction in daily log
```

### Workflow 4: Sponsor Analytics

```
SPONSOR VIEWS IMPACT:
1. Sponsor logs in → Dashboard
2. See key metrics:
   - Passes issued (count, total value)
   - Passes active/expired/pending
   - Redemption rate (%)
   - Total redeemed amount
   - Avg transaction value
   - Top 5 products purchased
   - Active merchants (count)
   - Active beneficiaries (count)
3. Click on metric for drill-down:
   - View all beneficiaries with pass details
   - View all transactions with details
   - View product breakdown (what was bought)
4. Filter options:
   - Date range (last 7 days, 30 days, custom)
   - Beneficiary segment (by age, household size)
   - Merchant (specific store or all)
   - Product category
5. Export to CSV/PDF
6. Share report with stakeholders
```

### Workflow 5: Admin Management

```
ADMIN MANAGES ECOSYSTEM:
1. Admin logs in → Dashboard → Admin Console
2. Sections available:
   
   A) USER MANAGEMENT
      - View all users by role
      - Approve pending beneficiary signups
      - Deactivate/suspend users
      - Reset passwords
      - View user activity log
   
   B) MERCHANT MANAGEMENT
      - View all merchants
      - Approve/reject merchant applications
      - Set commission rates (%)
      - View merchant transactions
      - View merchant settlement balances
   
   C) PRODUCT MANAGEMENT
      - View product catalog (100+)
      - Add new product
      - Edit nutrition metadata
      - Set compliance flags (organic, fair-trade, etc.)
      - Set product eligibility rules
   
   D) RULE CONFIGURATION
      - Pass validity defaults
      - Redemption limits (max per transaction, per day)
      - Product categories (allowed/denied)
      - Sponsor funding limits
      - Merchant whitelisting rules
   
   E) ANALYTICS SUMMARY
      - Total passes issued (system-wide)
      - Total transactions
      - Top merchants
      - Top products
      - System health metrics
   
   F) SYSTEM CONTROLS
      - Pause/resume pass creation
      - Pause/resume redemptions
      - View audit logs
      - Export system reports
```

---

## 3. Feature List by Module

### Module 1: Authentication & Authorization (Week 1, Days 1-2)

**Features:**
- ✅ Email-based signup/login
- ✅ Password hashing (bcrypt)
- ✅ Email verification (OTP/link)
- ✅ Password reset flow
- ✅ JWT token generation + refresh
- ✅ Role-based access control (RBAC) middleware
- ✅ Forgot password recovery
- ✅ Account activation/deactivation

**Endpoints:**
```
POST   /api/auth/signup              Create account
POST   /api/auth/verify-email        Confirm email
POST   /api/auth/login               Login (returns JWT)
POST   /api/auth/refresh             Refresh token
POST   /api/auth/password-reset      Request password reset
POST   /api/auth/password-reset/confirm  Confirm new password
POST   /api/auth/logout              Logout
```

### Module 2: User Profile Management (Week 1, Days 2-3)

**Features:**
- ✅ Personal profile (name, email, phone, DOB)
- ✅ Household profile (family members, ages, preferences)
- ✅ Profile photo/avatar
- ✅ Nutrition preferences (allergies, dietary restrictions)
- ✅ Address/location data
- ✅ Contact information verification
- ✅ Profile completeness indicator

**Endpoints:**
```
GET    /api/users/profile            Get current user profile
PUT    /api/users/profile            Update profile
GET    /api/users/household          Get household members
POST   /api/users/household          Add household member
PUT    /api/users/household/:id      Update household member
DELETE /api/users/household/:id      Remove household member
GET    /api/users/preferences        Get nutrition preferences
PUT    /api/users/preferences        Update preferences
```

### Module 3: Pass Issuance & Management (Week 1, Days 3-4)

**Features:**
- ✅ Create pass (sponsor only)
- ✅ Assign value (₹50-₹10K)
- ✅ Set validity period (7-365 days)
- ✅ Generate unique Pass ID
- ✅ Generate QR code (server-side)
- ✅ Assign beneficiary
- ✅ Send notification (SMS/email)
- ✅ Pass status tracking (active/expired/redeemed/partial)
- ✅ Pass history view

**Endpoints:**
```
POST   /api/passes                   Create new pass
GET    /api/passes                   List user passes
GET    /api/passes/:id               Get pass details
PUT    /api/passes/:id               Update pass (sponsor/admin)
GET    /api/passes/:id/qr            Get QR code image
POST   /api/passes/:id/notify        Resend notification
GET    /api/passes/:id/transactions  View pass transaction history
```

### Module 4: Merchant Redemption Interface (Week 1, Days 4-5)

**Features:**
- ✅ QR scanning interface (mobile-optimized)
- ✅ QR validation (checksum verification)
- ✅ Pass validation (not expired, amount available)
- ✅ Amount entry interface
- ✅ Product eligibility check
- ✅ Transaction approval/rejection
- ✅ Receipt generation
- ✅ Redemption history per merchant
- ✅ Real-time balance update

**Endpoints:**
```
POST   /api/passes/validate-qr       Scan & validate QR
POST   /api/passes/redeem            Submit redemption
GET    /api/passes/redeem-status/:id Check redemption status
GET    /api/merchants/transactions   Merchant transaction history
GET    /api/merchants/daily-summary  Daily redemption summary
```

### Module 5: Product Intelligence Database (Week 2, Days 1-2)

**Features:**
- ✅ Product catalog (100+ FMCG items)
- ✅ Product categories (Grains, Fruits, Vegetables, Dairy, etc.)
- ✅ Nutrition metadata (calories, protein, fat, carbs, fiber)
- ✅ Ingredients list
- ✅ Compliance flags (organic, fair-trade, local, etc.)
- ✅ Brand & manufacturer info
- ✅ Product images
- ✅ Product search & filter
- ✅ Eligible products display at redemption
- ✅ Sponsor can restrict categories

**Endpoints:**
```
GET    /api/products                 List all products
GET    /api/products/categories      Get product categories
GET    /api/products/search          Search by name/category
GET    /api/products/:id             Get product details
POST   /api/products                 Create product (admin)
PUT    /api/products/:id             Update product (admin)
GET    /api/products/eligibility/:passId  Get eligible products for pass
```

### Module 6: Sponsor Dashboard & Analytics (Week 2, Days 2-4)

**Features:**
- ✅ Overview dashboard (key metrics)
- ✅ Passes issued (count, value, active/expired)
- ✅ Redemption analytics (total, %, trends)
- ✅ Transaction drill-down (list all transactions)
- ✅ Beneficiary management (list, filter, view history)
- ✅ Merchant view (which merchants used)
- ✅ Product breakdown (top 10 purchased)
- ✅ Date range filtering
- ✅ Segment filtering (by beneficiary age, household size)
- ✅ CSV/PDF export
- ✅ Real-time updates (WebSocket)

**Endpoints:**
```
GET    /api/analytics/sponsor/dashboard    Get dashboard metrics
GET    /api/analytics/sponsor/passes       Passes issued summary
GET    /api/analytics/sponsor/redemptions  Redemptions analytics
GET    /api/analytics/sponsor/beneficiaries List beneficiaries
GET    /api/analytics/sponsor/merchants    Merchants used
GET    /api/analytics/sponsor/products     Product breakdown
GET    /api/analytics/sponsor/export       Export report (CSV/PDF)
```

### Module 7: Admin Controls (Week 2, Days 3-5)

**Features:**
- ✅ User management (approve/reject/deactivate)
- ✅ Merchant management (approve/set commission)
- ✅ Product management (add/edit/enable/disable)
- ✅ Rule configuration (defaults, limits)
- ✅ System controls (pause/resume)
- ✅ Audit logs (all system activities)
- ✅ Batch operations (approve multiple users)
- ✅ System health monitoring
- ✅ Permission management

**Endpoints:**
```
GET    /api/admin/users              List all users
POST   /api/admin/users/:id/approve  Approve user
POST   /api/admin/users/:id/deactivate  Deactivate user
GET    /api/admin/merchants          List merchants
POST   /api/admin/merchants/:id/approve  Approve merchant
PUT    /api/admin/merchants/:id/commission  Set commission
GET    /api/admin/products           Manage products
POST   /api/admin/system/pause       Pause system
POST   /api/admin/system/resume      Resume system
GET    /api/admin/audit-logs         View audit trail
```

### Module 8: Analytics & Reporting (Week 2, Days 4-5)

**Features:**
- ✅ System-wide KPIs (total passes, redeemed, users active)
- ✅ Trends (issued/redeemed over time)
- ✅ Top performers (merchants, beneficiaries, products)
- ✅ User activity metrics (signup rate, engagement)
- ✅ Transaction metrics (volume, value, frequency)
- ✅ Health metrics (system uptime, error rates)
- ✅ Custom reports (date range, filters)
- ✅ Dashboard visualization (charts, tables)
- ✅ Scheduled reports (email summary)

**Endpoints:**
```
GET    /api/analytics/system/kpis           System metrics
GET    /api/analytics/system/trends         Historical trends
GET    /api/analytics/system/top-merchants  Top merchants
GET    /api/analytics/system/top-products   Top products
GET    /api/analytics/system/user-activity  User engagement
GET    /api/analytics/system/health         System health
POST   /api/analytics/report/custom         Generate custom report
```

---

## 4. UI/UX Screens & Wireframes

### Screen List by Role

#### **Beneficiary Screens**
1. Login/Signup
2. Profile Completion
3. Dashboard (View passes)
4. Pass Details (Balance, QR code, expiry)
5. History (Transaction list)
6. Preferences (Nutrition settings)

#### **Merchant Screens**
1. Login
2. Dashboard (Daily summary)
3. Redemption Interface (QR scanner, amount entry)
4. Receipt/Confirmation
5. Daily Transaction Log
6. Settlement Balance

#### **Sponsor Screens**
1. Login/Signup
2. Organization Profile
3. Dashboard (Overview metrics)
4. Create Pass (Form)
5. Pass List & Manage
6. Analytics Dashboard (Charts, tables)
7. Beneficiary Management
8. Reports & Export

#### **Admin Screens**
1. Login
2. Admin Dashboard (System overview)
3. User Management (List, approve/reject)
4. Merchant Management (List, approve, commission)
5. Product Management (Catalog, add/edit)
6. Rule Configuration
7. System Controls
8. Audit Logs

### Key Wireframe Details

```
BENEFICIARY DASHBOARD:
┌─────────────────────────────────────┐
│ Smart Food Pass | Profile | Logout   │
├─────────────────────────────────────┤
│                                       │
│ Welcome, Ramesh!                      │
│                                       │
│ ACTIVE PASSES (2)                    │
│ ┌─────────────────────────────────┐  │
│ │ Pass ID: SFPASS-2026-001234      │  │
│ │ Value: ₹500 | Balance: ₹200      │  │
│ │ Expires: May 15, 2026             │  │
│ │ [View QR Code]  [History]         │  │
│ └─────────────────────────────────┘  │
│                                       │
│ EXPIRED PASSES (1)                   │
│ ┌─────────────────────────────────┐  │
│ │ Pass ID: SFPASS-2026-001233      │  │
│ │ Value: ₹300 | Balance: ₹0        │  │
│ │ Expired: Apr 10, 2026             │  │
│ └─────────────────────────────────┘  │
│                                       │
└─────────────────────────────────────┘
```

```
MERCHANT REDEMPTION SCREEN:
┌─────────────────────────────────────┐
│ Smart Food Pass | Profile | Logout   │
├─────────────────────────────────────┤
│                                       │
│ SCAN QR CODE                         │
│ ┌─────────────────────────────────┐  │
│ │ [Camera View]                    │  │
│ │                                  │  │
│ │                                  │  │
│ │ [Scan QR] or [Enter Pass ID]     │  │
│ └─────────────────────────────────┘  │
│                                       │
│ PASS VALIDATION RESULT:              │
│ ✓ Pass ID: SFPASS-2026-001234       │
│ ✓ Beneficiary: Ramesh Kumar         │
│ ✓ Balance: ₹500                     │
│ ✓ Expires: May 15, 2026             │
│                                       │
│ ENTER AMOUNT:                        │
│ [₹_______] [Clear] [OK]             │
│                                       │
│ [APPROVE] [REJECT]                   │
│                                       │
└─────────────────────────────────────┘
```

```
SPONSOR DASHBOARD:
┌─────────────────────────────────────┐
│ Smart Food Pass | Profile | Logout   │
├─────────────────────────────────────┤
│                                       │
│ OVERVIEW                             │
│ ┌──────────────┬──────────────────┐  │
│ │ Passes: 150  │ Redeemed: 125    │  │
│ │ Value: ₹75K  │ Total Redeemed   │  │
│ │              │ ₹62K (83%)       │  │
│ └──────────────┴──────────────────┘  │
│                                       │
│ TOP 5 PRODUCTS                       │
│ 1. Rice (2,340 units)                │
│ 2. Eggs (1,890 units)                │
│ 3. Vegetables (890 units)            │
│                                       │
│ [+CREATE PASS] [VIEW ANALYTICS]      │
│ [MANAGE BENEFICIARIES] [EXPORT]      │
│                                       │
└─────────────────────────────────────┘
```

---

## 5. API Specification

### Authentication & Authorization

**Base URL**: `http://localhost:3001/api`

**Headers** (all requests except auth):
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Core Endpoints (Minimum 25)

#### **Authentication (5 endpoints)**
```
POST   /auth/signup                 { email, password, role }
POST   /auth/verify-email           { email, otp }
POST   /auth/login                  { email, password }
POST   /auth/refresh                { refresh_token }
POST   /auth/logout                 (requires auth)
```

#### **User Profile (7 endpoints)**
```
GET    /users/profile               (requires auth)
PUT    /users/profile               { name, phone, dob, address }
GET    /users/household             (requires auth)
POST   /users/household             { name, age, relationship }
DELETE /users/household/:id         (requires auth)
GET    /users/preferences           (requires auth)
PUT    /users/preferences           { allergies, dietary_restrictions }
```

#### **Passes (8 endpoints)**
```
POST   /passes                      { beneficiary_id, value, validity_days, product_restrictions } (sponsor)
GET    /passes                      (requires auth)
GET    /passes/:id                  (requires auth)
GET    /passes/:id/qr               (returns PNG image)
POST   /passes/:id/notify           (sponsor/admin)
GET    /passes/:id/transactions     (requires auth)
POST   /passes/validate-qr          { qr_code } (merchant)
POST   /passes/redeem               { pass_id, amount } (merchant)
```

#### **Analytics (7 endpoints)**
```
GET    /analytics/sponsor/dashboard         (requires sponsor role)
GET    /analytics/sponsor/passes            (requires sponsor role)
GET    /analytics/sponsor/redemptions       { date_from, date_to }
GET    /analytics/sponsor/beneficiaries     (requires sponsor role)
GET    /analytics/sponsor/products          (requires sponsor role)
GET    /analytics/system/kpis              (requires admin role)
GET    /analytics/system/trends             (requires admin role)
```

### Error Responses

```json
{
  "statusCode": 400,
  "message": "Invalid pass ID",
  "error": "Bad Request"
}
```

---

## 6. Database Tables (10 Core Tables)

### Table: `users`
```sql
id (PK)
email (UNIQUE)
password_hash
phone
role (enum: beneficiary, sponsor, merchant, admin, super_admin)
first_name
last_name
dob
address
profile_image_url
is_active
email_verified
created_at
updated_at
```

### Table: `households`
```sql
id (PK)
user_id (FK to users)
name
members_count
created_at
updated_at
```

### Table: `household_members`
```sql
id (PK)
household_id (FK)
name
age
relationship
created_at
```

### Table: `sponsors`
```sql
id (PK)
user_id (FK to users)
organization_name
organization_type (enum: CSR, NGO, Government, Retail)
registration_number
contact_person
total_funded (decimal)
is_verified
created_at
updated_at
```

### Table: `merchants`
```sql
id (PK)
user_id (FK to users)
store_name
store_address
store_latitude
store_longitude
pos_type (enum: manual, smartphone, integrated)
commission_rate (percentage)
is_approved
is_active
total_redeemed (decimal)
created_at
updated_at
```

### Table: `passes`
```sql
id (PK)
pass_id_unique (UNIQUE, e.g., SFPASS-2026-001234)
qr_code_hash (SHA256 checksum)
beneficiary_id (FK to users)
sponsor_id (FK to sponsors)
value (decimal)
balance (decimal)
created_at
validity_start
validity_end
status (enum: active, expired, redeemed, partial, pending)
product_restrictions (JSON array of category IDs)
created_at
updated_at
```

### Table: `pass_transactions`
```sql
id (PK)
pass_id (FK to passes)
merchant_id (FK to merchants)
amount (decimal)
status (enum: pending, completed, rejected)
product_purchased (JSON array of product IDs)
blockchain_tx_hash (nullable)
transaction_timestamp
created_at
```

### Table: `product_catalog`
```sql
id (PK)
product_name
category (enum: grains, vegetables, fruits, dairy, protein, etc.)
brand
description
nutrition_json (JSON: calories, protein, fat, carbs, fiber)
ingredients (text)
compliance_flags (JSON array: organic, fair-trade, local, etc.)
product_image_url
is_approved
created_at
updated_at
```

### Table: `nutrition_profiles`
```sql
id (PK)
user_id (FK to users)
dietary_restrictions (JSON array)
allergies (JSON array)
preferences (JSON)
created_at
updated_at
```

### Table: `merchant_settlements`
```sql
id (PK)
merchant_id (FK to merchants)
settlement_date
amount_owed (decimal)
amount_paid (decimal)
payment_status (enum: pending, completed)
payment_date (nullable)
created_at
```

### Table: `audit_logs`
```sql
id (PK)
user_id (FK to users)
action (enum: create, update, delete, approve, reject, redeem)
entity_type (enum: pass, user, merchant, product, rule)
entity_id
old_value (JSON, nullable)
new_value (JSON, nullable)
status (enum: success, failed)
ip_address
user_agent
created_at
```

---

## 7. Smart Contract Integration

### Smart Contract Functions (Solidity)

```solidity
// Core functions
function issuePass(address _beneficiary, uint256 _value) public onlySponsors returns (uint256 passId)
function fundPass(uint256 _passId, uint256 _amount) public onlySponsors payable
function redeemPass(uint256 _passId, uint256 _amount) public onlyMerchants returns (bool)
function validateMerchant(address _merchant) public onlyAdmin
function expirePass(uint256 _passId) public onlyAdmin
function logTransaction(uint256 _passId, address _merchant, uint256 _amount, bytes32 _productHash) public
function pauseSystem() public onlyOwner
function resumeSystem() public onlyOwner

// Query functions
function getPass(uint256 _passId) public view returns (PassStruct)
function getPassBalance(uint256 _passId) public view returns (uint256)
function getMerchantTotal(address _merchant) public view returns (uint256)
function getTransactionCount() public view returns (uint256)
```

### API Bridge Endpoints

```
POST   /api/blockchain/fund-pass        Trigger fundPass() contract call
POST   /api/blockchain/redeem-pass      Trigger redeemPass() contract call
GET    /api/blockchain/transaction/:txHash   Get blockchain tx status
GET    /api/blockchain/contract-info    Get contract address + ABI
```

### Events Emitted

```solidity
event PassIssued(uint256 indexed passId, address indexed beneficiary, uint256 value)
event PassFunded(uint256 indexed passId, address indexed sponsor, uint256 amount)
event PassRedeemed(uint256 indexed passId, address indexed merchant, uint256 amount)
event MerchantValidated(address indexed merchant)
event TransactionLogged(uint256 indexed passId, address indexed merchant, uint256 amount, bytes32 productHash)
event SystemPaused(uint256 timestamp)
event SystemResumed(uint256 timestamp)
```

---

## 8. Success Metrics & KPIs

### MVP Success Criteria

| Criterion | Target | Definition |
|-----------|--------|-----------|
| **Sponsor Funding** | ✅ Sponsor can create pass | Pass created, stored, QR generated |
| **User Redemption** | ✅ User receives QR code | QR sent via email/SMS, displayable |
| **Merchant Validation** | ✅ Merchant can scan & redeem | QR scanned, pass validated, balance updated |
| **Transaction Logging** | ✅ Transaction logged | Database entry + blockchain tx hash |
| **Sponsor Analytics** | ✅ Dashboard shows impact | KPIs visible, drill-down functional |
| **Admin Controls** | ✅ System manageable | Users/merchants/products admin-editable |
| **Core Use Case** | ✅ Works end-to-end | Full flow from funding to analytics |

### Key Performance Indicators (MVP)

```
ADOPTION METRICS:
- Total users registered: 100+ (for MVP demo)
- Users by role: 5 sponsors, 10 merchants, 50 beneficiaries
- Pass creation rate: 20 passes/day target

ENGAGEMENT METRICS:
- Passes issued: 100+
- Redemption rate: 70%+ of issued passes
- Avg transaction value: ₹300
- Repeat user rate: 60%+

QUALITY METRICS:
- Pass validation success rate: 99%+
- Error rate: <1%
- Transaction confirmation time: <5 seconds

BUSINESS METRICS:
- System uptime: 99.5%+
- Average response time: <500ms
- Cost per transaction: <0.50 ₹

COMPLIANCE METRICS:
- Product compliance rate: 100% (validated products only)
- Audit log completeness: 100%
- Data encryption: TLS 1.2+
```

---

## 9. Integration Points (MVP)

### Email Service Integration
- **Provider**: SendGrid or AWS SES
- **Use**: Verification emails, pass notifications, password resets
- **Volume**: ~100 emails/day (MVP)

### SMS Service Integration (Optional for MVP)
- **Provider**: Twilio or Nexmo
- **Use**: Beneficiary notifications, OTP verification
- **Volume**: ~50 SMS/day (MVP)

### QR Code Service
- **Library**: `qrcode` (Node.js library)
- **Server-side generation**: No third-party dependency
- **Format**: PNG image with embedded pass ID + checksum

### Blockchain Service
- **Network**: Polygon Mumbai (testnet)
- **RPC Endpoint**: https://rpc-mumbai.maticvigil.com
- **Deployed Contract**: SmartFoodPass.sol
- **Gas Estimation Tool**: Hardhat

### Analytics Database
- **Database**: PostgreSQL 14+
- **Connection Pool**: Node.js pool (10-20 connections)
- **Backup**: Daily snapshots

---

## 10. Non-Functional Requirements

### Security
- ✅ HTTPS/TLS 1.2+ for all API calls
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 24h expiry
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured for frontend domain only
- ✅ Rate limiting: 100 requests/minute per IP
- ✅ Input validation on all endpoints
- ✅ Audit logs for all sensitive operations

### Performance
- ✅ API response time: <500ms (p95)
- ✅ Database query time: <200ms (p95)
- ✅ Page load time: <2s (frontend)
- ✅ Concurrent users: 1000+ (MVP)
- ✅ Database connection pool: 20 connections

### Availability
- ✅ System uptime: 99.5%+
- ✅ Graceful degradation (fallback to cached data)
- ✅ Health check endpoint: `/api/health`
- ✅ Automated alerts for downtime

### Scalability (Phase 2)
- ✅ Stateless backend (can horizontal scale)
- ✅ Database read replicas (phase 2)
- ✅ CDN for frontend assets (Vercel)
- ✅ Caching layer (Redis, phase 2)

---

## 11. Testing Strategy

### Test Coverage Targets
- Unit tests: 80%+ (services, utilities)
- Integration tests: 60%+ (API endpoints)
- E2E tests: Core workflows

### Test Cases by Module

**Module 1 - Auth**:
- Valid signup with new email
- Signup with existing email (should fail)
- Valid login with correct password
- Login with wrong password (should fail)
- Token refresh
- Password reset flow

**Module 3 - Passes**:
- Create pass as sponsor
- Create pass as non-sponsor (should fail)
- Scan valid QR code
- Scan invalid QR code
- Redeem with sufficient balance
- Redeem with insufficient balance (should fail)
- Redeem expired pass (should fail)

**Module 6 - Analytics**:
- Dashboard metrics calculation
- Filter by date range
- Export to CSV
- Verify accuracy of aggregations

---

## 12. Deployment & DevOps

### Deployment Strategy

```
DEVELOPMENT (Local)
├── Backend: localhost:3001
├── Frontend: localhost:3000
├── Database: Local PostgreSQL
└── Contracts: Hardhat (local)

STAGING (Cloud)
├── Frontend: Vercel preview
├── Backend: Cloud Run / Lambda
├── Database: Managed PostgreSQL (Aiven/AWS)
└── Contracts: Polygon Mumbai testnet

PRODUCTION (Post-MVP)
├── Frontend: Vercel production
├── Backend: Cloud Run / Kubernetes
├── Database: PostgreSQL with replication
└── Contracts: Polygon mainnet / Arbitrum
```

### CI/CD Pipeline
- **VCS**: GitHub
- **CI/CD**: GitHub Actions
- **Build**: Docker
- **Test**: Automated (Jest, Hardhat)
- **Deploy**: Automatic on merge to main

---

## 13. Rollout Plan

**Week 1 End (Day 5):**
- ✅ Modules 1-4 functional and tested
- ✅ Clickable demo available
- ✅ Deployed to staging URL
- ✅ Ready for internal demo

**Week 2 End (Day 10):**
- ✅ All 8 modules integrated
- ✅ Smart contract deployed to testnet
- ✅ Full end-to-end flow tested
- ✅ Analytics dashboard complete
- ✅ Admin console operational
- ✅ Venture-demo-ready MVP

---

## Approval & Sign-Off

**Version**: 1.0  
**Date**: April 19, 2026  
**Status**: MVP Sprint Implementation

**Next Review**: End of Week 1 (April 26, 2026)

---

**Smart Food Pass Platform - MVP Requirements**  
*Venture-Demo-Ready Grocery Access Infrastructure*

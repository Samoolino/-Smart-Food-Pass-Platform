# Smart Food Pass Protocol

## Technical Specification

### 1. Overview

Smart Food Pass is a blockchain-integrated access and settlement platform for sponsor-funded food and product access. The protocol coordinates pass issuance, merchant redemption, nutrition-aware eligibility, and auditable transaction tracking across smart contracts, backend services, database workflows, and frontend applications.

### 2. Core Product Goals

- enable sponsors to fund controlled access balances
- issue programmable passes to approved beneficiaries
- restrict redemption to verified merchants and eligible product ranges
- support nutrition-aware product access policies
- maintain auditability across contract, API, and database layers

### 3. Contract Model

The startup architecture is anchored by a funded base contract that defines issuance capacity, subscription-backed value blocks, vault-routing for designated overflow policies, and programmable pass constraints.

Core responsibilities:

- maintain issuance scope and capital boundaries
- map subscription plans to pass value ceilings
- support beneficiary-linked pass creation
- allow policy-controlled recharge or renewal windows
- expose data required for backend reconciliation and analytics

### 4. Agentic Policy Layer

The protocol supports backend-managed policy agents for:

- merchant and product access control
- nutrition-aware product selection support
- subscription eligibility and renewal logic
- unused-value rollover or spillover policies where approved

### 5. Compliance Layer

The operating model is designed to support:

- KYC and AML controls
- merchant and sponsor verification
- identity upgrade paths such as national identity and OAuth providers
- food quality and product documentation controls aligned with HACCP, GMP, and QMS-oriented evidence models

### 6. MVP Functional Modules

#### Authentication
- email and password access
- JWT issue and refresh
- role-based access control
- password recovery and verification placeholders

#### User and Profile
- user, sponsor, merchant, and beneficiary records
- household data support
- nutrition preferences support

#### Passes
- create pass
- assign beneficiary
- generate pass ID
- generate QR-linked redemption data
- track status and history

#### Redemption
- validate merchant
- validate pass balance and expiry
- create transaction records
- return receipt-ready payloads

#### Product Catalog
- categories and filters
- eligibility-aware selection
- admin CRUD operations

#### Analytics
- sponsor dashboard metrics
- admin KPI summaries
- export-ready reporting support

### 7. Delivery Roadmap

#### Stage 1
- backend stabilization
- environment setup
- auth and profile foundation
- database entities, migrations, and seeds

#### Stage 2
- pass issuance
- merchant redemption
- product catalog
- sponsor analytics

#### Stage 3
- frontend integration
- blockchain bridge
- admin controls
- shared DTO and type alignment

#### Stage 4
- testing
- demo data
- staging deployment
- release documentation

### 8. Target Outcome

The MVP target is a system where a sponsor can fund a program, issue a pass to a beneficiary, enable validated redemption at a merchant, record the transaction, and review audit-ready analytics.

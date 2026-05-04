const marketStores = [
  {
    name: 'Registry Market Store',
    source: 'REGISTRY_DB_SELECTION',
    products: '1,240 approved products',
    status: '$WO ready'
  },
  {
    name: 'API Connected Supermarket',
    source: 'ECOMMERCE_API',
    products: 'Live inventory sync',
    status: 'Price validation active'
  },
  {
    name: 'Pilot Vendor Network',
    source: 'INVENTORY_LOG_FILE',
    products: 'Regional food catalog',
    status: 'West Africa pilot'
  }
];

const plans = [
  ['General Access', 'Flexible food basket scope for family and individual nutrition needs.'],
  ['Target Nutrition', 'Plan values shaped by nutrition matrix, product scope, and scheduled $WO credits.'],
  ['CSR and Relief', 'Institution-backed provision for welfare, emergency response, and community support.']
];

const contracts = [
  ['Subscription Plan Registry', 'Anchors package metadata, funding value, credit schedule, and plan status.'],
  ['Victuals Pass Manager', 'Controls pass issue state, value reservation, capture, and available $WO balance.'],
  ['Entitlement Scheduler', 'Anchors scheduled pass credits, validity windows, and credit timing.'],
  ['Nutrition Policy Anchor', 'Anchors nutrition matrix version hashes and target policy windows.'],
  ['Redemption Verifier', 'Anchors basket hash, pass set hash, nutrition scope hash, nonce, and capture state.'],
  ['Settlement Anchor', 'Anchors merchant settlement batch proof and settlement lifecycle.']
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <nav className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#home">
            <span className="brand-mark">V</span>
            <span>VICTUALS</span>
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#markets">Market stores</a>
            <a href="#plans">Plans</a>
            <a href="#contracts">Contracts</a>
          </div>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">$WO-powered nutritional access</span>
            <h1>Smart Nutritional Food Plan Pass.</h1>
            <p className="hero-copy">
              VICTUALS connects plan subscribers, accredited merchants, product registries,
              nutritional intelligence, and smart-contract proof states into one market-ready
              food access platform.
            </p>
            <div className="actions">
              <a className="button primary" href="#markets">Explore market stores</a>
              <a className="button gold" href="#plans">Start a package</a>
              <a className="button secondary" href="#contracts">View contract overview</a>
            </div>
          </div>

          <div className="panel">
            <div className="value-card">
              <span>Sample pass value</span>
              <strong>$WO 50</strong>
              <p>Biweekly pass credit with local-currency equivalent, QR readiness, and merchant capture state.</p>
            </div>
            <div className="metric-grid">
              <div className="metric"><span>Market</span>Nigeria / West Africa pilot</div>
              <div className="metric"><span>Accreditation</span>KYC verified for transactions</div>
              <div className="metric"><span>Merchant source</span>API, inventory file, registry DB</div>
              <div className="metric"><span>Proof state</span>Plan, pass, QR, settlement</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Fast transaction flow, nutrition-aware by design.</h2>
            <p>
              A subscriber funds a package, the user receives $WO pass value, the nutrition engine
              validates eligible products, and merchants capture approved QR redemptions.
            </p>
          </div>
          <div className="card-grid">
            <div className="card"><span className="tag gold">1</span><h3>Package funded</h3><p>Fiat, stablecoin, or approved asset inflow becomes $WO package value.</p></div>
            <div className="card"><span className="tag">2</span><h3>Pass credited</h3><p>Scheduled $WO value is issued into the user's active Victuals Pass.</p></div>
            <div className="card"><span className="tag blue">3</span><h3>QR captured</h3><p>Merchant validates basket, pass scope, nutrition scope, and settlement readiness.</p></div>
          </div>
        </div>
      </section>

      <section id="markets" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Multiple market spaces, one approved registry.</h2>
            <p>
              Users select merchant options from accredited stores connected by e-commerce APIs,
              inventory uploads, dashboard entries, or registry database selection.
            </p>
          </div>
          <div className="card-grid">
            {marketStores.map((store) => (
              <article className="card store-card" key={store.name}>
                <div className="store-top">
                  <span className="tag blue">{store.source}</span>
                  <span className="tag gold">{store.status}</span>
                </div>
                <h3>{store.name}</h3>
                <p>{store.products}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Plans and packages shaped by nutritional targets.</h2>
            <p>
              Package values are defined by target product requirements, nutritional matrix scope,
              available treasury-backed $WO capacity, credit schedule, and market pricing.
            </p>
          </div>
          <div className="card-grid">
            {plans.map(([name, copy]) => (
              <article className="card" key={name}>
                <span className="tag gold">$WO package</span>
                <h3>{name}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Product and Nutritional Intelligence.</h2>
            <p>
              The frontend shows approved products, merchant availability, price validation, product
              restrictions, and combined nutritional scope for users with multiple active passes.
            </p>
          </div>
          <div className="card-grid">
            <div className="card"><span className="tag">Product Registry</span><h3>Approved catalog</h3><p>Product identity, nutrition data, price, and merchant inventory feed into eligibility.</p></div>
            <div className="card"><span className="tag">Nutrition Matrix</span><h3>Target scope</h3><p>Plan goals define product categories and basket suggestions for each user pass set.</p></div>
            <div className="card"><span className="tag">QR Readiness</span><h3>Verified basket</h3><p>Basket hash, pass set hash, and nutrition scope hash prepare the redemption intent.</p></div>
          </div>
        </div>
      </section>

      <section id="contracts" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Contract-backed operational overview.</h2>
            <p>
              The app explains contract modules as operational proof cards, not hidden backend details.
            </p>
          </div>
          <div className="proof-list">
            {contracts.map(([name, copy]) => (
              <article className="card proof-card" key={name}>
                <span className="tag blue">Proof module</span>
                <h3>{name}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <strong>VICTUALS</strong>
          <p>Smart Nutritional Food Plan Pass — multi-market, $WO-powered, nutrition-aware access.</p>
        </div>
      </footer>
    </main>
  );
}

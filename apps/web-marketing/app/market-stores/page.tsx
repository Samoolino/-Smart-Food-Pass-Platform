const marketOptions = [
  {
    name: 'E-commerce API Stores',
    source: 'ECOMMERCE_API',
    description: 'Large merchants can connect live product, price, stock, and checkout-like inventory feeds through store APIs.',
    status: 'Fast sync',
    proof: 'Merchant Registry + Product Registry'
  },
  {
    name: 'Inventory Logfile Stores',
    source: 'INVENTORY_LOG_FILE',
    description: 'Merchants upload structured inventory files for product matching, price validation, and basket eligibility.',
    status: 'Pilot friendly',
    proof: 'Product Registry + Price Approval'
  },
  {
    name: 'Registry DB Storefronts',
    source: 'REGISTRY_DB_SELECTION',
    description: 'Merchants select from the approved VICTUALS registry and attach their local price, availability, and store location.',
    status: '$WO enabled',
    proof: 'Registry Version Hash'
  },
  {
    name: 'Manual Merchant Dashboard',
    source: 'MERCHANT_DASHBOARD_ENTRY',
    description: 'Small merchants can manage inventory and price updates directly from the merchant app during the pilot phase.',
    status: 'Accessible entry',
    proof: 'Merchant Accreditation State'
  }
];

const filters = [
  'Country and region',
  'Merchant accreditation',
  'Inventory source type',
  'Eligible product count',
  '$WO acceptance readiness',
  'Settlement availability'
];

export default function MarketStoresPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Multi-market merchant access</span>
            <h1>Choose stores from an approved market registry.</h1>
            <p className="hero-copy">
              VICTUALS users select merchant spaces from API-connected stores, inventory logfiles,
              merchant dashboard entries, or registry database storefronts. Each option is filtered
              by user pass scope, nutritional eligibility, price approval, and $WO readiness.
            </p>
            <div className="actions">
              <a className="button primary" href="/">Back home</a>
              <a className="button gold" href="/plans">View plan values</a>
            </div>
          </div>
          <div className="panel">
            <div className="value-card">
              <span>Market selection output</span>
              <strong>Store + Scope</strong>
              <p>Market choice combines merchant accreditation, inventory source, product scope, and $WO transaction readiness.</p>
            </div>
            <div className="metric-grid">
              <div className="metric"><span>Default pilot</span>West Africa</div>
              <div className="metric"><span>Value unit</span>$WO + local currency</div>
              <div className="metric"><span>Product access</span>Nutrition matrix filtered</div>
              <div className="metric"><span>Merchant state</span>Accredited only</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Market store options.</h2>
            <p>
              The registry does not force one store model. It lets merchants connect according to their maturity level while keeping product and transaction rules consistent.
            </p>
          </div>
          <div className="card-grid">
            {marketOptions.map((option) => (
              <article className="card store-card" key={option.name}>
                <div className="store-top">
                  <span className="tag blue">{option.source}</span>
                  <span className="tag gold">{option.status}</span>
                </div>
                <h3>{option.name}</h3>
                <p>{option.description}</p>
                <span className="tag">{option.proof}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Store selection filters.</h2>
            <p>
              The frontend should expose fast filters so users do not browse products they cannot redeem with their current pass scope.
            </p>
          </div>
          <div className="card-grid">
            {filters.map((filter) => (
              <article className="card" key={filter}>
                <span className="tag">Filter</span>
                <h3>{filter}</h3>
                <p>Used by the market page to accelerate selection and reduce failed QR redemption attempts.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

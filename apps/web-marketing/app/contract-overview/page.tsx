const modules = [
  {
    name: 'Subscription Plan Registry',
    utility: 'Plan/package governance',
    proof: 'Plan metadata hash, funding value, credit amount, validity, status',
    frontend: 'Plans page, funder portal, admin console'
  },
  {
    name: 'Victuals Pass Manager',
    utility: 'User pass value state',
    proof: 'Pass issue state, reserved value, captured value, available value',
    frontend: 'User wallet, QR redemption, merchant capture'
  },
  {
    name: 'Entitlement Scheduler',
    utility: 'Credit timing and repletion',
    proof: 'Next credit timestamp, interval, validity, schedule status',
    frontend: 'Pass schedule, package explanation, wallet timeline'
  },
  {
    name: 'Nutrition Policy Anchor',
    utility: 'Nutrition matrix versioning',
    proof: 'Policy version hash, category mask, effective window, active status',
    frontend: 'Nutrition scope, product eligibility, basket explanation'
  },
  {
    name: 'Redemption Verifier',
    utility: 'QR redemption proof',
    proof: 'Basket hash, pass set hash, nutrition scope hash, nonce, capture status',
    frontend: 'QR generation, merchant scan, redemption history'
  },
  {
    name: 'Settlement Anchor',
    utility: 'Merchant settlement proof',
    proof: 'Settlement batch hash, merchant id, ledger root, settlement state',
    frontend: 'Merchant balance, admin settlement review, payout status'
  }
];

const operationalViews = [
  'Contract address registry',
  'Network selection state',
  'Proof card per transaction',
  'Registry version visibility',
  'Settlement batch status',
  'Treasury release capacity display'
];

export default function ContractOverviewPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Operational contract overview</span>
            <h1>Contracts become proof cards for the app.</h1>
            <p className="hero-copy">
              VICTUALS should not hide its contract architecture. The frontend converts each module into
              a clear operational proof card for plans, passes, repletion, nutrition policy, redemption, and settlement.
            </p>
            <div className="actions">
              <a className="button primary" href="/">Back home</a>
              <a className="button gold" href="/plans">View plans</a>
            </div>
          </div>
          <div className="panel">
            <div className="value-card">
              <span>Frontend contract role</span>
              <strong>Proof UI</strong>
              <p>Each transaction can show the state proof that supports the user's action and merchant confirmation.</p>
            </div>
            <div className="metric-grid">
              <div className="metric"><span>Network</span>Configurable EVM</div>
              <div className="metric"><span>Proof type</span>Registry + lifecycle</div>
              <div className="metric"><span>Value</span>$WO anchored flow</div>
              <div className="metric"><span>Settlement</span>Batch proof</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Contract modules and frontend utility.</h2>
            <p>
              These cards define what the user, merchant, funder, and admin should understand from each deployed module.
            </p>
          </div>
          <div className="proof-list">
            {modules.map((module) => (
              <article className="card proof-card" key={module.name}>
                <span className="tag blue">{module.utility}</span>
                <h3>{module.name}</h3>
                <p><strong>Proof:</strong> {module.proof}</p>
                <p><strong>Frontend:</strong> {module.frontend}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Operational views to add next.</h2>
            <p>
              The app should show contract state only where it helps a decision: value, validity, proof, settlement, or network context.
            </p>
          </div>
          <div className="card-grid">
            {operationalViews.map((view) => (
              <article className="card" key={view}>
                <span className="tag gold">App proof</span>
                <h3>{view}</h3>
                <p>Designed for admin, merchant, or user clarity without exposing unnecessary contract complexity.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const packageTypes = [
  {
    name: 'General Nutritional Access',
    value: '$WO 50 biweekly',
    description: 'Flexible food access for users and families where product scope can improve with feedback and local availability.',
    target: 'General approved product scope'
  },
  {
    name: 'Family Nutrition Package',
    value: '$WO 200 monthly',
    description: 'Household-oriented package with basket suggestions across staple foods, proteins, produce, and approved essentials.',
    target: 'Family basket continuity'
  },
  {
    name: 'Target Nutrition Package',
    value: 'Matrix-priced',
    description: 'Plan value is determined by product requirements, nutritional target, market prices, and validity schedule.',
    target: 'Nutrition matrix policy'
  },
  {
    name: 'CSR / Welfare Package',
    value: 'Institution-funded',
    description: 'Subscriber-funded package for community support, relief, institutional welfare, or planned food support.',
    target: 'Group allocation and reporting'
  }
];

const valuationRules = [
  'Package value is calculated before pass issuance.',
  'Product requirements and nutrition matrix define target cost scope.',
  '$WO release must fit available treasury capacity.',
  'Credit amount and interval define wallet repletion schedule.',
  'Local currency equivalent is shown for market clarity.',
  'Contract proof anchors plan metadata, credit value, and schedule.'
];

export default function PlansPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Plans, packages, and $WO value</span>
            <h1>Package values shaped by nutritional targets.</h1>
            <p className="hero-copy">
              VICTUALS plan values are not arbitrary. They are derived from target product requirements,
              nutritional matrix rules, market prices, credit schedules, treasury release capacity, and local currency context.
            </p>
            <div className="actions">
              <a className="button primary" href="/market-stores">Explore stores</a>
              <a className="button secondary" href="/contract-overview">View contract proof</a>
            </div>
          </div>
          <div className="panel">
            <div className="value-card">
              <span>Package display model</span>
              <strong>$WO + Local</strong>
              <p>Every plan should show $WO value, local-currency equivalent, credit schedule, validity, and product scope.</p>
            </div>
            <div className="metric-grid">
              <div className="metric"><span>Value source</span>Target product matrix</div>
              <div className="metric"><span>Release check</span>Treasury capacity</div>
              <div className="metric"><span>Wallet flow</span>Scheduled credits</div>
              <div className="metric"><span>Proof</span>Plan metadata hash</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Package options.</h2>
            <p>
              These are starter display categories. Exact prices should come from service-side valuation using market products and treasury capacity.
            </p>
          </div>
          <div className="card-grid">
            {packageTypes.map((pkg) => (
              <article className="card" key={pkg.name}>
                <span className="tag gold">{pkg.value}</span>
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
                <span className="tag">{pkg.target}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Valuation and repletion rules.</h2>
            <p>
              The frontend should explain why a package has its value, how often it credits a pass, and whether enough $WO capacity exists.
            </p>
          </div>
          <div className="card-grid">
            {valuationRules.map((rule) => (
              <article className="card" key={rule}>
                <span className="tag blue">Rule</span>
                <h3>{rule}</h3>
                <p>Shown as a transparent package explanation before subscriber funding and user pass assignment.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

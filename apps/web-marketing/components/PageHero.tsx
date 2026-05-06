import { WOValueCard, type WOValueMetric } from './WOValueCard';

export interface PageHeroAction {
  href: string;
  label: string;
  variant?: 'primary' | 'gold' | 'secondary';
}

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: PageHeroAction[];
  valueLabel: string;
  value: string;
  valueCopy: string;
  metrics: WOValueMetric[];
}

export function PageHero({
  eyebrow,
  title,
  copy,
  actions = [],
  valueLabel,
  value,
  valueCopy,
  metrics
}: PageHeroProps) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="hero-copy">{copy}</p>
          {actions.length > 0 && (
            <div className="actions">
              {actions.map((action) => (
                <a className={`button ${action.variant ?? 'secondary'}`} href={action.href} key={action.href}>
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <WOValueCard label={valueLabel} value={value} copy={valueCopy} metrics={metrics} />
        </div>
      </div>
    </section>
  );
}

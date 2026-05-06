export interface WOValueMetric {
  label: string;
  value: string;
}

export interface WOValueCardProps {
  label: string;
  value: string;
  copy: string;
  metrics?: WOValueMetric[];
}

export function WOValueCard({ label, value, copy, metrics = [] }: WOValueCardProps) {
  return (
    <>
      <div className="value-card">
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{copy}</p>
      </div>
      {metrics.length > 0 && (
        <div className="metric-grid">
          {metrics.map((metric) => (
            <div className="metric" key={`${metric.label}-${metric.value}`}>
              <span>{metric.label}</span>
              {metric.value}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

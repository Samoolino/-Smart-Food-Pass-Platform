export interface MarketStoreCardProps {
  name: string;
  source: string;
  description: string;
  status: string;
  proof?: string;
}

export function MarketStoreCard({ name, source, description, status, proof }: MarketStoreCardProps) {
  return (
    <article className="card store-card">
      <div className="store-top">
        <span className="tag blue">{source}</span>
        <span className="tag gold">{status}</span>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      {proof && <span className="tag">{proof}</span>}
    </article>
  );
}

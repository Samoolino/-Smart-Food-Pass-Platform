export interface ProofCardProps {
  name: string;
  utility?: string;
  proof: string;
  frontend?: string;
}

export function ProofCard({ name, utility = 'Proof module', proof, frontend }: ProofCardProps) {
  return (
    <article className="card proof-card">
      <span className="tag blue">{utility}</span>
      <h3>{name}</h3>
      <p>{proof}</p>
      {frontend && <p><strong>Frontend:</strong> {frontend}</p>}
    </article>
  );
}

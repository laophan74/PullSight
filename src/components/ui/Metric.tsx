type MetricProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'risk';
};

export function Metric({ label, value, detail, tone }: MetricProps) {
  return (
    <article className={`metric ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

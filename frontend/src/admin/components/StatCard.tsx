type Props = { title: string; value: string | number };

export const StatCard = ({ title, value }: Props) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);


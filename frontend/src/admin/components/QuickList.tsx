type Props = {
  title: string;
  items: any[];
  renderItem: (item: any) => string;
  emptyMessage?: string;
};

export const QuickList = ({ title, items, renderItem, emptyMessage = "No hay datos disponibles." }: Props) => (
  <div className="quick-list">
    <h3 className="quick-list-title">{title}</h3>
    {items.length === 0 ? (
      <p className="quick-list-empty">{emptyMessage}</p>
    ) : (
      <ul>
        {items.map((item, i) => (
          <li key={i}>{renderItem(item)}</li>
        ))}
      </ul>
    )}
  </div>
);

type Props = {
  title: string;
  items: any[];
  renderItem: (item: any) => string;
};

export const QuickList = ({ title, items, renderItem }: Props) => (
  <div className="quick-list">
    <h3>{title}</h3>
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  </div>
);

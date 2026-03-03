import './ItemCard.css';

function ItemCard({ item, onDelete, onView }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="item-card">
      <div className="item-card-header">
        <h3>{item.name}</h3>
        <span className={`category-badge category-${item.category}`}>
          {item.category}
        </span>
      </div>
      <div className="item-card-body">
        <p className="item-brand">ブランド: {item.brand}</p>
        <p className="item-price">{formatPrice(item.purchase_price)}</p>
        <p className="item-date">{formatDate(item.purchase_date)}</p>
      </div>
      <div className="item-card-actions">
        <button onClick={() => onView(item.id)} className="btn-view">
          詳細
        </button>
        <button onClick={() => onDelete(item.id)} className="btn-delete">
          削除
        </button>
      </div>
    </div>
  );
}

export default ItemCard;

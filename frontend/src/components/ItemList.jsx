import { useState, useEffect } from 'react';
import { getAllItems, deleteItem } from '../api/items';
import ItemCard from './ItemCard';
import './ItemList.css';

function ItemList({ onViewItem, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', '時計', 'バッグ', 'ジュエリー', '靴', 'その他'];

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllItems();
      setItems(data);
    } catch (err) {
      setError('アイテムの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このアイテムを削除しますか？')) {
      return;
    }

    try {
      await deleteItem(id);
      loadItems(); // リストを再読み込み
    } catch (err) {
      alert('削除に失敗しました: ' + err.message);
      console.error(err);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadItems} className="btn-retry">再試行</button>
      </div>
    );
  }

  return (
    <div className="item-list">
      <div className="filter-section">
        <label>カテゴリーでフィルター:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'すべて' : cat}
            </option>
          ))}
        </select>
        <span className="item-count">({filteredItems.length} 件)</span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>アイテムがありません</p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onView={onViewItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;

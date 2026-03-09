import { useState, useEffect } from 'react';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import Summary from './components/Summary';
import { getItemById, healthCheck } from './api/items';
import './App.css';
import SearchForm from './components/SearchForm'

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [serverStatus, setServerStatus] = useState('checking');

  // 启动时检查服务器状态
  useEffect(() => {
    healthCheck().then(isHealthy => {
      setServerStatus(isHealthy ? 'online' : 'offline');
    });
  }, []);

  const handleAddItem = () => {
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleEditItem = () => {
    setShowForm(true);
    // selectedItem 保持，ItemForm に initialItem として渡す
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewItem = async (id) => {
    try {
      const item = await getItemById(id);
      setSelectedItem(item);
      setShowForm(false);
    } catch (err) {
      alert('アイテムの取得に失敗しました: ' + err.message);
      console.error(err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedItem(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>所持品管理システム</h1>
          <div className="server-status">
            <span className={`status-indicator ${serverStatus}`}></span>
            {serverStatus === 'online' ? 'サーバー接続済' : serverStatus === 'checking' ? '接続確認中...' : 'サーバー未接続'}
          </div>
        </div>
        <button onClick={handleAddItem} className="btn-add">
          + 新しいアイテムを追加
        </button>
      </header>

      <main className="app-main">
        {showForm ? (
          <div className="form-section">
            <ItemForm
              initialItem={selectedItem}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        ) : selectedItem ? (
          <div className="item-detail">
            <h2>アイテム詳細</h2>
            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedItem.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">名前:</span>
                <span className="detail-value">{selectedItem.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">カテゴリー:</span>
                <span className={`category-badge category-${selectedItem.category}`}>
                  {selectedItem.category}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ブランド:</span>
                <span className="detail-value">{selectedItem.brand}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">購入価格:</span>
                <span className="detail-value price">{formatPrice(selectedItem.purchase_price)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">購入日:</span>
                <span className="detail-value">{formatDate(selectedItem.purchase_date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">作成日:</span>
                <span className="detail-value">{formatDateTime(selectedItem.created_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">更新日:</span>
                <span className="detail-value">{formatDateTime(selectedItem.updated_at)}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button onClick={handleEditItem} className="btn-edit">
                編集
              </button>
              <button onClick={handleCloseForm} className="btn-back">
                ← 一覧に戻る
              </button>
            </div>
          </div>
        ) : (
          <>
            <SearchForm />
            <Summary refreshTrigger={refreshTrigger} />
            <ItemList
              onViewItem={handleViewItem}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
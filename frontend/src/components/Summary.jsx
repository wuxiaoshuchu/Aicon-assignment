import { useState, useEffect } from 'react';
import { getSummary } from '../api/items';
import './Summary.css';

function Summary({ refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await getSummary();
      setSummary(data);
    } catch (err) {
      console.error('統計情報の取得に失敗しました', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="summary-loading">読み込み中...</div>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="summary">
      <h2>カテゴリー別統計</h2>
      <div className="summary-grid">
        {Object.entries(summary.categories).map(([category, count]) => (
          <div key={category} className="summary-item">
            <div className="summary-category">{category}</div>
            <div className="summary-count">{count}</div>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <strong>合計: {summary.total} 件</strong>
      </div>
    </div>
  );
}

export default Summary;

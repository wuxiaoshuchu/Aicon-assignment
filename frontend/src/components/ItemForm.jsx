import { useState, useEffect } from 'react';
import { createItem, updateItem } from '../api/items';
import './ItemForm.css';

function ItemForm({ initialItem, onSuccess, onCancel }) {
  const isEditMode = !!initialItem;

  const [formData, setFormData] = useState({
    name: '',
    category: '時計',
    brand: '',
    purchase_price: '',
    purchase_date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name || '',
        category: initialItem.category || '時計',
        brand: initialItem.brand || '',
        purchase_price: initialItem.purchase_price ?? '',
        purchase_date: initialItem.purchase_date || '',
      });
    }
  }, [initialItem]);

  const categories = ['時計', 'バッグ', 'ジュエリー', '靴', 'その他'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    } else if (formData.name.length > 100) {
      newErrors.name = '名前は100文字以内で入力してください';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'ブランドは必須です';
    } else if (formData.brand.length > 100) {
      newErrors.brand = 'ブランドは100文字以内で入力してください';
    }

    if (formData.purchase_price === '' || formData.purchase_price < 0) {
      newErrors.purchase_price = '購入価格は0以上の値を入力してください';
    }

    if (!formData.purchase_date) {
      newErrors.purchase_date = '購入日は必須です';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.purchase_date)) {
        newErrors.purchase_date = 'YYYY-MM-DD形式で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        purchase_price: parseInt(formData.purchase_price, 10),
        purchase_date: formData.purchase_date,
      };
      if (isEditMode) {
        await updateItem(initialItem.id, itemData);
      } else {
        await createItem(itemData);
      }
      onSuccess();
      // フォームをリセット（新規追加時のみ）
      if (!isEditMode) {
        setFormData({
          name: '',
          category: '時計',
          brand: '',
          purchase_price: '',
          purchase_date: '',
        });
        setErrors({});
      }
    } catch (err) {
      if (err.details) {
        setErrors({ submit: err.details.join(', ') });
      } else {
        setErrors({
          submit: err.message || (isEditMode ? 'アイテムの更新に失敗しました' : 'アイテムの作成に失敗しました'),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="item-form-container">
      <h2>{isEditMode ? 'アイテムを編集' : '新しいアイテムを追加'}</h2>
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="name">名前 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="例: ロレックス デイトナ"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">カテゴリー *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="brand">ブランド *</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={errors.brand ? 'error' : ''}
            placeholder="例: ROLEX"
          />
          {errors.brand && <span className="error-message">{errors.brand}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="purchase_price">購入価格 (円) *</label>
          <input
            type="number"
            id="purchase_price"
            name="purchase_price"
            value={formData.purchase_price}
            onChange={handleChange}
            min="0"
            className={errors.purchase_price ? 'error' : ''}
            placeholder="例: 1500000"
          />
          {errors.purchase_price && (
            <span className="error-message">{errors.purchase_price}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="purchase_date">購入日 *</label>
          <input
            type="date"
            id="purchase_date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className={errors.purchase_date ? 'error' : ''}
          />
          {errors.purchase_date && (
            <span className="error-message">{errors.purchase_date}</span>
          )}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting
              ? (isEditMode ? '更新中...' : '作成中...')
              : (isEditMode ? '更新' : '作成')}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ItemForm;

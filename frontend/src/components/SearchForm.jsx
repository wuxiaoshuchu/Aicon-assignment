import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [searchName, setSearchName] = useState('')
  const [searchCategory, setSearchCategory] = useState('全部')

  const categories = ['全部', '時計', 'バッグ', 'ジュエリー', '靴', 'その他']

  const handleSubmit = () => {
    // ここに console.log を書く
  }

  return (
    <div>
      {/* 文字入力 */}
      <input
        type="text"
        value={searchName}
        onChange={/* ここ */}
        placeholder="商品名で検索"
      />

      {/* カテゴリー選択 */}
      <select
        value={searchCategory}
        onChange={/* ここ */}
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* 検索ボタン */}
      <button onClick={handleSubmit}>検索</button>
    </div>
  )
}

export default SearchForm
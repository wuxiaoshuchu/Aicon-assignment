import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [searchName, setSearchName] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')

  const categories = ['all', '時計', 'バッグ', 'ジュエリー', '靴', 'その他']

  const handleSubmit = () => {
    onSearch({ name: searchName, category: searchCategory })
  }

  const handleReset = () => {
    setSearchName('')
    setSearchCategory('all')
    onSearch({ name: '', category: 'all' })
  }

  return (
    <div className="search-form">
      <input
        type="text"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        placeholder="商品名で検索"
        className="search-input"
      />

      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
        className="search-select"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>
            {cat === 'all' ? 'すべて' : cat}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit} className="btn-search">検索</button>
      <button onClick={handleReset} className="btn-reset">リセット</button>
    </div>
  )
}

export default SearchForm
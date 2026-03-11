import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [searchName, setSearchName] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')
  const [searchSort, setSearchSort] = useState('')

  const categories = ['all', '時計', 'バッグ', 'ジュエリー', '靴', 'その他']
  const sortOptions = [
    { value: '', label: 'デフォルト（新着順）' },
    { value: 'price_asc', label: '価格が安い順' },
    { value: 'price_desc', label: '価格が高い順' },
    { value: 'name_asc', label: '名前順' },
  ]

  const handleSubmit = () => {
    onSearch({ name: searchName, category: searchCategory, sort: searchSort })
  }

  const handleReset = () => {
    setSearchName('')
    setSearchCategory('all')
    onSearch({ name: '', category: 'all', sort:'' })
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
      <select
        value={searchSort}
        onChange={(e) => setSearchSort(e.target.value)}
        className="search-select"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit} className="btn-search">検索</button>
      <button onClick={handleReset} className="btn-reset">リセット</button>
    </div>
  )
}

export default SearchForm
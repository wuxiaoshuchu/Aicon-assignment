import { useState } from 'react'

function SearchForm({ onSearch }) {
  const [searchName, setSearchName] = useState('')
  const [searchCategory, setSearchCategory] = useState('全部')

  const categories = ['全部', '時計', 'バッグ', 'ジュエリー', '靴', 'その他']

  const handleSubmit = () => {
    console.log(searchName, searchCategory)
  }

  return (
    <div>
      {/* 文字入力 */}
      <input
        type="text"
        value={searchName}
        /* onChange 需要的是一个函数 结构应该是 : onChange={/* 接收 e，然后用 e.target.value 调用 setSearchName */
        onChange={(e) => setSearchName(e.target.value)} /* setSearchName是一个函数，调用函数要用() */
        /* onChange是一个箭头函数 */
        /* e 是事件对象，需要从箭头函数的参数里接收进来，不然函数不知道 e 是什么 */
        placeholder="商品名で検索"
      />

      {/* カテゴリー選択 */}
      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
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
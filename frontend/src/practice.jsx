import { useState, useEffect } from 'react'

function Practice() {
  // ここに useState を書く
    const [count, setCount] = useState(0)
  // ここに useEffect を書く
    useEffect(() => {
        console.log(`数字变了，现在是${count}`)
    },[count])
    useEffect(() => {
        console.log(`页面加载了`)
    },[])
  return (
    <div>
      {/* ここに画面を書く */}
      <button onClick={() => setCount(count + 1)}>
        {count}
      </button>
    </div>
  )
}

export default Practice
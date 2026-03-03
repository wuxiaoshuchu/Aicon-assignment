import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// 切换不同的课程：修改下面这行
import App from './App.jsx'           // 原版本
// import App from './App_lesson3.jsx'     // 第三课：按钮和点击事件
// import App from './App_lesson2.jsx'   // 第二课：使用变量
// import App from './App_lesson1.jsx'   // 第一课：Hello World

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

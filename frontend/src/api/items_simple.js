// ============================================
// API 函数 - 用来和后端通信
// 这是简化版本，有详细的中文注释
// ============================================

import axios from 'axios';

// 后端服务器的地址
const API_BASE_URL = 'http://localhost:8080';

// 创建一个 axios 实例（用来发送 HTTP 请求）
const api = axios.create({
  baseURL: API_BASE_URL,  // 基础地址
  headers: {
    'Content-Type': 'application/json',  // 告诉服务器我们发送的是 JSON 数据
  },
  timeout: 5000,  // 5秒超时（如果5秒还没响应，就认为失败了）
});

// ============================================
// 处理错误的函数
// ============================================
function handleError(error) {
  if (error.response) {
    // 服务器返回了错误（比如 404, 500）
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(`サーバーエラー: ${error.response.status}`);
  } else if (error.request) {
    // 请求发送了，但没有收到响应（可能是服务器没启动）
    console.error('Network Error:', error.request);
    throw new Error('サーバーに接続できません。バックエンドが起動しているか確認してください。');
  } else {
    // 其他错误
    console.error('Error:', error.message);
    throw new Error(`エラー: ${error.message}`);
  }
}

// ============================================
// 健康检查 - 检查服务器是否在线
// ============================================
export async function healthCheck() {
  try {
    // 发送 GET 请求到 /health
    const response = await api.get('/health');
    
    // 如果状态码是 200，说明服务器在线
    return response.status === 200;
  } catch (error) {
    // 如果出错了，说明服务器离线
    return false;
  }
}

// ============================================
// 获取所有物品
// ============================================
export async function getAllItems() {
  try {
    // 发送 GET 请求到 /items
    const response = await api.get('/items');
    
    // 返回数据
    return response.data;
  } catch (error) {
    // 如果出错了，处理错误
    handleError(error);
  }
}

// ============================================
// 根据 ID 获取单个物品
// ============================================
export async function getItemById(id) {
  try {
    // 发送 GET 请求到 /items/{id}
    // 比如 id 是 1，就请求 /items/1
    const response = await api.get(`/items/${id}`);
    
    // 返回数据
    return response.data;
  } catch (error) {
    // 如果出错了，处理错误
    handleError(error);
  }
}

// ============================================
// 创建新物品
// ============================================
export async function createItem(itemData) {
  try {
    // 发送 POST 请求到 /items
    // itemData 是要创建的物品数据
    const response = await api.post('/items', itemData);
    
    // 返回创建好的物品数据
    return response.data;
  } catch (error) {
    // 如果出错了
    if (error.response && error.response.data && error.response.data.details) {
      // 如果有详细的错误信息
      const errorMsg = new Error(error.response.data.details.join(', '));
      errorMsg.details = error.response.data.details;
      throw errorMsg;
    } else {
      // 否则使用通用的错误处理
      handleError(error);
    }
  }
}

// ============================================
// 删除物品
// ============================================
export async function deleteItem(id) {
  try {
    // 发送 DELETE 请求到 /items/{id}
    // 比如 id 是 1，就请求 /items/1
    await api.delete(`/items/${id}`);
    
    // 删除成功，不需要返回数据
  } catch (error) {
    // 如果出错了，处理错误
    handleError(error);
  }
}

// ============================================
// 获取统计信息
// ============================================
export async function getSummary() {
  try {
    // 发送 GET 请求到 /items/summary
    const response = await api.get('/items/summary');
    
    // 返回数据
    return response.data;
  } catch (error) {
    // 如果出错了，处理错误
    handleError(error);
  }
}

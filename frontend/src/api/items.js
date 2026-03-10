import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// 创建 axios 实例，添加错误处理
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5秒超时
});

// 错误处理辅助函数
const handleError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(`サーバーエラー: ${error.response.status}`);
  } else if (error.request) {
    console.error('Network Error:', error.request);
    throw new Error('サーバーに接続できません。バックエンドが起動しているか確認してください。');
  } else {
    console.error('Error:', error.message);
    throw new Error(`エラー: ${error.message}`);
  }
};

// 健康检查
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// 获取所有物品
export const getAllItems = async (filters) => {
  const params = {} ;

  if (filters?.name != ''){
    params.name = filters.name;
  }
  if (filters?.category != "all"){
    params.category = filters.category;
  }
  try {
    const response = await api.get('/items',{ params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 获取单个物品
export const getItemById = async (id) => {
  try {
    const response = await api.get(`/items/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 创建物品
export const createItem = async (itemData) => {
  try {
    const response = await api.post('/items', itemData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.details) {
      const errorMsg = new Error(error.response.data.details.join(', '));
      errorMsg.details = error.response.data.details;
      throw errorMsg;
    }
    handleError(error);
  }
};

// 更新物品
export const updateItem = async (id, itemData) => {
  try {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.details) {
      const errorMsg = new Error(error.response.data.details.join(', '));
      errorMsg.details = error.response.data.details;
      throw errorMsg;
    }
    handleError(error);
  }
};

// 删除物品
export const deleteItem = async (id) => {
  try {
    await api.delete(`/items/${id}`);
  } catch (error) {
    handleError(error);
  }
};

// 获取统计信息
export const getSummary = async () => {
  try {
    const response = await api.get('/items/summary');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
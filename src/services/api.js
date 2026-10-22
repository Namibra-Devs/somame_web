import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://edie2i0oywal8nbqiy4q96tb.161.97.80.67.sslip.io';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('somame_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

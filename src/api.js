import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aiko-olhovivo-proxy.aikodigital.io',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = '708a28796db35b0ce807f4c7719502eeea6b2b9a09d72342a71fcae367f5533e';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

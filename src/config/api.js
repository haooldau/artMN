// API基础URL配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://你的zeabur域名/api'
  : 'http://localhost:3001/api';

export default API_BASE_URL; 
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // 这样就可以自动处理
  : 'http://localhost:3001/api';

export default API_BASE_URL; 
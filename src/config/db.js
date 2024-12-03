// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// MySQL 连接池配置
const pool = mysql.createPool({
  host: '172.21.0.6',
  port: 3306,
  user: 'root',
  password: 'ch763164982*',
  database: 'art',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// API 路由
app.post('/api/performances', async (req, res) => {
  try {
    const { artist, type, province, city, venue, notes } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO performances (artist, type, province, city, venue, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [artist, type, province, city, venue, notes]
    );

    res.json({ 
      success: true, 
      message: '数据提交成功',
      data: result
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 获取演出信息列表
app.get('/api/performances', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM performances ORDER BY created_at DESC');
    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
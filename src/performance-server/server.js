// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// 启用 CORS 和 JSON 解析
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://你的zeabur域名'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // 确保这个目录存在
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件！'));
    }
    cb(null, true);
  }
});

// 静态文件服务
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 在创建连接池后添加测试连接代码
pool.getConnection()
  .then(connection => {
    console.log('数据库连接成功！');
    console.log('数据库配置:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    console.error('数据库配置:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
  });

// 添加更详细的错误处理
pool.on('error', (err) => {
  console.error('数据库池错误:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('数据库连接丢失');
  }
});

// 测试路由 - 检查服务器状态
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 添加演出信息
app.post('/api/performances', upload.single('poster'), async (req, res) => {
  try {
    console.log('接收到的数据:', req.body);
    console.log('接收到的文件:', req.file);

    const data = {
      artist: req.body.artist || null,
      type: req.body.type || null,
      province: req.body.province || null,
      city: req.body.city || null,
      venue: req.body.venue || null,
      notes: req.body.notes || null,
      date: req.body.date || null,
      poster: req.file ? `/api/uploads/${req.file.filename}` : null
    };

    // 验证必填字段
    if (!data.artist || !data.type || !data.province) {
      return res.status(400).json({
        success: false,
        message: '艺人、演出类型和省份是必填字段'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO performances (artist, type, province, city, venue, notes, date, poster) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.artist, data.type, data.province, data.city, data.venue, data.notes, data.date, data.poster]
    );

    console.log('插入结果:', result);

    res.json({ 
      success: true, 
      message: '数据提交成功',
      data: result
    });
  } catch (error) {
    console.error('数据库错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 获取所有演出信息
app.get('/api/performances', async (req, res) => {
  try {
    console.log('收到获取演出数据请求');
    
    const sql = `
      SELECT 
        id,
        artist,
        type,
        province,
        city,
        venue,
        notes,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        poster,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM performances 
      ORDER BY created_at DESC
    `;
    
    console.log('执行SQL查询:', sql);
    
    const [rows] = await pool.execute(sql);
    console.log(`查询到 ${rows.length} 条记录`);
    
    if (rows.length > 0) {
      console.log('数据示例:', {
        firstRow: rows[0],
        lastRow: rows[rows.length - 1]
      });
    }

    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (error) {
    console.error('获取数据错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 按省份获取演出信息
app.get('/api/performances/province/:province', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d") as formatted_date FROM performances WHERE province = ? ORDER BY created_at DESC',
      [req.params.province]
    );
    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (error) {
    console.error('获取省份数据错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 按艺人获取演出信息
app.get('/api/performances/artist/:artist', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d") as formatted_date FROM performances WHERE artist = ? ORDER BY date DESC',
      [req.params.artist]
    );
    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (error) {
    console.error('获取艺人数据错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 删除演出信息
app.delete('/api/performances/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM performances WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false, 
        message: '未找到要删除的记录' 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: '删除成功' 
    });
  } catch (error) {
    console.error('删除数据错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 获取所有艺人列表
app.get('/api/artists', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT artist FROM performances ORDER BY artist'
    );
    res.json({ 
      success: true, 
      data: rows.map(row => row.artist)
    });
  } catch (error) {
    console.error('获取艺人列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
});

// 更新演出信息
app.put('/api/performances/:id', upload.single('poster'), async (req, res) => {
  try {
    const data = {
      artist: req.body.artist || null,
      type: req.body.type || null,
      province: req.body.province || null,
      city: req.body.city || null,
      venue: req.body.venue || null,
      notes: req.body.notes || null,
      date: req.body.date || null,
    };

    // 如果有新上传的海报，更新海报路径
    if (req.file) {
      data.poster = `/api/uploads/${req.file.filename}`;
    }

    // 验证必填字段
    if (!data.artist || !data.type || !data.province) {
      return res.status(400).json({
        success: false,
        message: '艺人、演出类型和省份是必填字段'
      });
    }

    // 构建 SQL 更新语句
    const fields = Object.keys(data);
    const values = Object.values(data);
    const sql = `
      UPDATE performances 
      SET ${fields.map(field => `${field} = ?`).join(', ')}
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [...values, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到要更新的记录'
      });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: result
    });
  } catch (error) {
    console.error('更新数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误：' + error.message
    });
  }
});

// 确保上传目录存在
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// 性能优化
app.set('json spaces', 2);
app.set('x-powered-by', false);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 添加一个用于检查表结构的路由
app.get('/api/check-schema', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      DESCRIBE performances
    `);
    console.log('表结构:', rows);
    res.json({ 
      success: true, 
      schema: rows 
    });
  } catch (error) {
    console.error('获取表结构错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取表结构失败：' + error.message 
    });
  }
});
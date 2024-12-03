const { connectDB, Performance } = require('./db');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        const performances = await Performance.find()
          .sort({ created_at: -1 })
          .lean();
        
        return res.status(200).json({ 
          success: true, 
          data: performances 
        });

      case 'POST':
        const { artist, type, province, city, venue, notes, date } = req.body;
        
        if (!artist || !type || !province) {
          return res.status(400).json({
            success: false,
            message: '艺人、演出类型和省份是必填字段'
          });
        }

        const newPerformance = new Performance({
          artist,
          type,
          province,
          city,
          venue,
          notes,
          date: date ? new Date(date) : null
        });

        const savedPerformance = await newPerformance.save();
        
        return res.status(200).json({ 
          success: true, 
          message: '数据提交成功',
          data: savedPerformance
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} Not Allowed` 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误：' + error.message 
    });
  }
}; 
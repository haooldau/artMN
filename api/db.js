const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// 定义演出信息的Schema
const performanceSchema = new mongoose.Schema({
  artist: { type: String, required: true },
  type: { type: String, required: true },
  province: { type: String, required: true },
  city: String,
  venue: String,
  notes: String,
  date: Date,
  poster: String,
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 添加虚拟字段
performanceSchema.virtual('formatted_date').get(function() {
  return this.created_at ? new Date(this.created_at).toLocaleDateString('zh-CN') : '';
});

// 创建模型
let Performance;
try {
  Performance = mongoose.model('Performance');
} catch {
  Performance = mongoose.model('Performance', performanceSchema);
}

module.exports = {
  connectDB,
  Performance
}; 
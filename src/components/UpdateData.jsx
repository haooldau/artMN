import React, { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Calendar, Users, Music, MapPin, Building2, Image as ImageIcon } from 'lucide-react';

const UpdateData = () => {
  const [formData, setFormData] = useState({
    artist: '',
    type: '',
    date: '',
    province: '',
    city: '',
    venue: '',
    poster: null
  });

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        poster: file
      }));
      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerConfetti = () => {
    // 左边的彩花
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.2, y: 0.6 }
    });

    // 右边的彩花
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.8, y: 0.6 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post('http://localhost:3001/api/performances', formDataToSend);
      
      if (response.data.success) {
        // 清空表单
        setFormData({
          artist: '',
          type: '',
          date: '',
          province: '',
          city: '',
          venue: '',
          poster: null
        });
        setPreviewUrl(null);
        
        // 触发撒花效果
        triggerConfetti();
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full p-8 bg-[#1a1b1e] text-white overflow-hidden relative">
      {/* 背景光斑 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff2d2d]/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#ff2d2d]/3 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative h-full w-full max-w-3xl mx-auto bg-black/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 pb-4 bg-gradient-to-r from-[#ff2d2d]/10 to-transparent backdrop-blur-sm border-b border-white/5 flex-none">
          <h1 className="text-2xl font-medium text-white">
            更新演出信息
            <span className="ml-2 text-[#ff2d2d]/50">Update Performance</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">添加新的演出信息到数据库</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 艺人 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>艺人</span>
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                placeholder="请输入艺人名称"
              />
            </div>

            {/* 类型 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>类型</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white appearance-none cursor-pointer transition-all duration-300"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em 1em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">选择类型</option>
                <option value="演唱会">演唱会</option>
                <option value="音乐节">音乐节</option>
              </select>
            </div>

            {/* 日期 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>日期</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
              />
            </div>

            {/* 省份 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>省份</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                placeholder="例如：浙江省"
              />
            </div>

            {/* 城市 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>城市</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                placeholder="例如：杭州市"
              />
            </div>

            {/* 场馆 */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>场馆</span>
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                placeholder="演出场馆名称"
              />
            </div>
          </div>

          {/* 海报上传 */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>海报</span>
            </label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img 
                  src={previewUrl}
                  alt="海报预览"
                  className="w-24 h-24 rounded-lg object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/40 text-xs">
                  暂无海报
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="poster-upload"
              />
              <label 
                htmlFor="poster-upload"
                className="px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 cursor-pointer transition-all duration-300 text-sm flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {previewUrl ? '更换海报' : '上传海报'}
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-[#ff2d2d]/10 hover:bg-[#ff2d2d]/20 text-white flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>提交中...</span>
                </>
              ) : (
                <span>提交</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateData; 
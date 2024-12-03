import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import API_BASE_URL from '../config/api';

// 添加必要的CSS样式
const styles = `
  .flip-card {
    height: 100%;
    perspective: 1000px;
  }
  
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: left;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }
  
  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }
  
  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background-color: #000000 !important;
  }
  
  .flip-card-back {
    transform: rotateY(180deg);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(147, 197, 253, 0.1);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(147, 197, 253, 0.2);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(147, 197, 253, 0.3);
  }
`;

const StatisticsView = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistPerformances, setArtistPerformances] = useState([]);
  const [flippedCard, setFlippedCard] = useState(null);

  // 首先定义所有计算函数
  const calculateMarketStats = (data) => {
    const totalPerformances = data.length;
    
    const allMonths = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    const monthlyStats = allMonths.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    data.forEach(performance => {
      const month = new Date(performance.date).toLocaleDateString('zh-CN', { month: 'long' });
      monthlyStats[month]++;
    });

    const monthlyData = Object.entries(monthlyStats)
      .map(([month, count]) => ({
        month,
        count
      }));

    return { totalPerformances, monthlyData };
  };

  // 然后使用 useMemo 计算统计数据
  const { totalPerformances, monthlyData } = useMemo(() => {
    return calculateMarketStats(performanceData);
  }, [performanceData]);

  // 数据检查日志
  useEffect(() => {
    if (monthlyData && totalPerformances) {
      console.log('Monthly Data:', monthlyData);
      console.log('Total Performances:', totalPerformances);
    }
  }, [monthlyData, totalPerformances]);

  // 获取数据
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/performances'
        : '/api/performances';

      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取演出数据失败: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success && responseData.data) {
        const performances = responseData.data.map(perf => ({
          ...perf,
          date: new Date(perf.date),
          created_at: new Date(perf.created_at)
        }));
        setPerformanceData(performances);
      } else {
        throw new Error('数据格式不正确');
      }
    } catch (error) {
      console.error('数据获取错误:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 自定义 Tooltip 组件
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md p-4 rounded-lg border border-[#bfdbfe]/20 shadow-xl">
          <p className="text-[#bfdbfe]/80">{label}</p>
          <p className="text-[#bfdbfe] font-medium">{payload[0].value} 场演出</p>
        </div>
      );
    }
    return null;
  };

  // 计算艺人出场统计
  const calculateArtistStats = () => {
    // 不限制时间范围，统计所有演出数据
    const artistStats = performanceData.reduce((acc, performance) => {
      acc[performance.artist] = (acc[performance.artist] || 0) + 1;
      return acc;
    }, {});

    // 转换为数组并排序
    const sortedArtists = Object.entries(artistStats)
      .map(([artist, count]) => ({
        artist,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只取前10名

    return sortedArtists;
  };

  // 计算省份演出统计
  const calculateProvinceStats = () => {
    const provinceStats = performanceData.reduce((acc, performance) => {
      const province = performance.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '');
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(provinceStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([province, count]) => ({
        province,
        count
      }));
  };

  // 处理月度演出点击
  const handleMonthClick = (entry) => {
    const monthPerformances = performanceData.filter(perf => {
      const perfMonth = new Date(perf.date).toLocaleDateString('zh-CN', { month: 'long' });
      return perfMonth === entry.month;
    });
    setSelectedMonth({ month: entry.month, performances: monthPerformances });
    setFlippedCard('month');
  };

  // 处理艺人点击
  const handleArtistClick = (artist) => {
    const artistPerfs = performanceData.filter(perf => perf.artist === artist);
    setSelectedArtist(artist);
    setArtistPerformances(artistPerfs);
    setFlippedCard('artist');
  };

  // 处理省份点击
  const handleProvinceClick = (entry) => {
    const provincePerformances = performanceData.filter(perf => {
      const province = perf.province.replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '');
      return province === entry.province;
    });
    setSelectedProvince({ province: entry.province, performances: provincePerformances });
    setFlippedCard('province');
  };

  // 修改图片路径处理
  const getImageUrl = (poster) => {
    if (!poster) return 'https://via.placeholder.com/160?text=暂无图片';
    return process.env.NODE_ENV === 'development'
      ? `http://localhost:3001${poster}`
      : poster;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        错误: {error}
      </div>
    );
  }

  const artistStats = calculateArtistStats();
  const provinceStats = calculateProvinceStats();

  return (
    <>
      <style>{styles}</style>
      <div className="p-8 bg-[#0f172a] text-white min-h-screen relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#93c5fd] to-[#60a5fa]">
              数据统计
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 市场演出统计卡片 */}
            <div className={`flip-card relative z-10 aspect-[4/3] ${flippedCard === 'month' ? 'flipped' : ''}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-black rounded-2xl border border-[#93c5fd]/20 p-6 shadow-lg 
                  transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,197,253,0.15)] 
                  hover:border-[#93c5fd]/30 hover:translate-y-[-2px] group h-full"
                >
                  <div className="flex items-center mb-6">
                    <span className="bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] w-1.5 h-6 rounded-full mr-3 
                      group-hover:h-8 transition-all duration-300" 
                    />
                    <h2 className="text-xl font-medium">市场演出统计</h2>
                  </div>

                  <div className="h-[calc(100%-4rem)] flex flex-col">
                    <div className="bg-black/80 rounded-xl p-4 border border-[#93c5fd]/10 
                      group-hover:border-[#93c5fd]/20 transition-all duration-300 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-[#93c5fd]/80 font-medium">全国演出总数</h3>
                        <p className="text-3xl font-bold bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] 
                          bg-clip-text text-transparent"
                        >
                          {totalPerformances}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={monthlyData}
                          margin={{ top: 5, right: 25, left: 25, bottom: 35 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(147,197,253,0.05)" 
                            vertical={false}
                          />
                          <XAxis 
                            dataKey="month" 
                            stroke="#93c5fd" 
                            tick={{ fill: "#93c5fd", fontSize: 11 }}
                            axisLine={{ stroke: '#1e3a8a' }}
                            height={40}
                            tickMargin={12}
                            interval={0}
                          />
                          <YAxis 
                            stroke="#93c5fd" 
                            tick={{ fill: "#93c5fd" }} 
                            axisLine={{ stroke: '#1e3a8a' }}
                            width={35}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={false} />
                          <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                            onClick={handleMonthClick}
                            style={{ cursor: 'pointer' }}
                          >
                            {monthlyData.map((entry, index) => (
                              <Cell 
                                key={index}
                                fill={`url(#barGradient-${index})`}
                                className="hover:opacity-80 transition-opacity duration-200"
                              />
                            ))}
                          </Bar>
                          <defs>
                            {monthlyData.map((entry, index) => (
                              <linearGradient
                                key={index}
                                id={`barGradient-${index}`}
                                x1="0" y1="0" x2="0" y2="1"
                              >
                                <stop offset="0%" stopColor="#1e40af" stopOpacity={0.95} />
                                <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.85} />
                              </linearGradient>
                            ))}
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="flip-card-back bg-black rounded-2xl border border-[#93c5fd]/20 shadow-lg h-full">
                  {selectedMonth && (
                    <div className="h-full flex flex-col">
                      <div className="p-6 border-b border-[#93c5fd]/20 flex items-center flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedMonth(null);
                            setFlippedCard(null);
                          }}
                          className="flex items-center text-[#93c5fd]/80 hover:text-[#93c5fd] 
                            transition-colors duration-300 group"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 
                            transition-transform duration-300" 
                          />
                          返回统计
                        </button>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
                        <h3 className="text-xl font-medium mb-6 bg-gradient-to-r from-[#93c5fd] 
                          to-[#60a5fa] bg-clip-text text-transparent sticky top-0 bg-black/80 
                          backdrop-blur-sm py-2"
                        >
                          {selectedMonth.month} 演出统计
                        </h3>
                        <div className="space-y-4">
                          {selectedMonth.performances.map((performance, index) => (
                            <div key={index} 
                              className="bg-black/80 rounded-xl p-5 border border-[#93c5fd]/10 
                                hover:border-[#93c5fd]/30 transition-all duration-300 hover:transform hover:translate-y-[-2px] 
                                hover:shadow-[0_0_20px_rgba(147,197,253,0.1)] group"
                            >
                              <div className="font-medium text-[#93c5fd] mb-3 group-hover:text-[#60a5fa] transition-colors duration-300">
                                {performance.artist}
                              </div>
                              <div className="text-sm space-y-1.5 text-[#93c5fd]/70">
                                <div>日期: {new Date(performance.date).toLocaleDateString('zh-CN')}</div>
                                <div>地点: {performance.province} {performance.city}</div>
                                <div>场馆: {performance.venue || '未设置'}</div>
                              </div>
                              {performance.poster && (
                                <div className="mt-4 relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#93c5fd]/20 to-[#60a5fa]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <img
                                    src={getImageUrl(performance.poster)}
                                    alt="演出海报"
                                    className="w-full h-32 object-cover rounded-lg ring-1 ring-[#93c5fd]/20 group-hover:ring-[#93c5fd]/40 transition-all duration-300"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/160?text=暂无图片';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 艺人出场统计卡片 */}
            <div className={`flip-card relative z-0 aspect-[4/3] ${flippedCard === 'artist' ? 'flipped' : ''}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-black rounded-2xl border border-[#93c5fd]/20 p-6 shadow-lg 
                  transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,197,253,0.15)] 
                  hover:border-[#93c5fd]/30 hover:translate-y-[-2px] group h-full"
                >
                  <h2 className="text-xl font-medium mb-6 flex items-center">
                    <span className="bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] w-1.5 h-6 rounded-full mr-3 
                      group-hover:h-8 transition-all duration-300" 
                    />
                    艺人出场统计（近6个月Top10）
                  </h2>
                  <div className="h-[calc(100%-4rem)]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={artistStats} 
                        layout="vertical"
                        margin={{ top: 5, right: 25, left: 25, bottom: 5 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(147,197,253,0.05)" 
                          horizontal={false}
                        />
                        <XAxis 
                          type="number" 
                          stroke="#93c5fd" 
                          tick={{ fill: "#93c5fd" }}
                          axisLine={{ stroke: '#1e3a8a' }}
                        />
                        <YAxis 
                          dataKey="artist" 
                          type="category" 
                          width={100}
                          tick={{ fontSize: 12, fill: "#93c5fd" }}
                          axisLine={{ stroke: '#1e3a8a' }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={false}
                        />
                        <Bar 
                          dataKey="count" 
                          radius={[0, 4, 4, 0]}
                          onClick={(data) => handleArtistClick(data.artist)}
                          style={{ cursor: 'pointer' }}
                          isAnimationActive={false}
                          activeBar={false}
                        >
                          {artistStats.map((entry, index) => (
                            <Cell 
                              key={index}
                              fill={`url(#artistBarGradient-${index})`}
                              className="hover:opacity-80 transition-opacity duration-200"
                            />
                          ))}
                        </Bar>
                        <defs>
                          {artistStats.map((entry, index) => (
                            <linearGradient
                              key={index}
                              id={`artistBarGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#1e40af" stopOpacity={0.95} />
                              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.85} />
                            </linearGradient>
                          ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flip-card-back bg-black rounded-2xl border border-[#93c5fd]/20 shadow-lg h-full">
                  {selectedArtist && (
                    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedArtist(null);
                          setFlippedCard(null);
                        }}
                        className="flex items-center text-[#93c5fd]/80 hover:text-[#93c5fd] transition-colors duration-300 mb-6 group"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
                        返回统计
                      </button>
                      <h3 className="text-xl font-medium mb-6 bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] bg-clip-text text-transparent">
                        {selectedArtist} 演出统计
                      </h3>
                      <div className="space-y-4">
                        {artistPerformances.map((performance, index) => (
                          <div key={index} 
                            className="bg-black/80 rounded-xl p-5 border border-[#93c5fd]/10 
                              hover:border-[#93c5fd]/30 transition-all duration-300 hover:transform hover:translate-y-[-2px] 
                              hover:shadow-[0_0_20px_rgba(147,197,253,0.1)] group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-[#93c5fd] group-hover:text-[#60a5fa] transition-colors duration-300">
                                {performance.artist}
                              </div>
                              <div className="text-sm text-[#93c5fd]/70 group-hover:text-[#60a5fa] transition-colors duration-300">
                                {new Date(performance.date).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                            <div className="text-sm space-y-1.5 text-[#93c5fd]/70">
                              <div>地点: {performance.province} {performance.city}</div>
                              <div>场馆: {performance.venue || '未设置'}</div>
                              {performance.type && <div>类型: {performance.type}</div>}
                            </div>
                            {performance.poster && (
                              <div className="mt-4 relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#93c5fd]/20 to-[#60a5fa]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <img
                                  src={getImageUrl(performance.poster)}
                                  alt="演出海报"
                                  className="w-full h-32 object-cover rounded-lg ring-1 ring-[#93c5fd]/20 group-hover:ring-[#93c5fd]/40 transition-all duration-300"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/160?text=暂无图片';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 省份演出统计卡片 */}
            <div className={`flip-card relative z-0 aspect-[4/3] ${flippedCard === 'province' ? 'flipped' : ''}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-black rounded-2xl border border-[#93c5fd]/20 p-6 shadow-lg 
                  transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,197,253,0.15)] 
                  hover:border-[#93c5fd]/30 hover:translate-y-[-2px] group h-full"
                >
                  <h2 className="text-xl font-medium mb-6 flex items-center">
                    <span className="bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] w-1.5 h-6 rounded-full mr-3 
                      group-hover:h-8 transition-all duration-300" 
                    />
                    省份演出统计（Top10）
                  </h2>
                  <div className="h-[calc(100%-4rem)]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={provinceStats} 
                        layout="vertical"
                        margin={{ top: 5, right: 25, left: 25, bottom: 5 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(147,197,253,0.05)" 
                          horizontal={false}
                        />
                        <XAxis 
                          type="number" 
                          stroke="#93c5fd" 
                          tick={{ fill: "#93c5fd" }}
                          axisLine={{ stroke: '#1e3a8a' }}
                        />
                        <YAxis 
                          dataKey="province" 
                          type="category" 
                          width={100}
                          tick={{ fontSize: 12, fill: "#93c5fd" }}
                          axisLine={{ stroke: '#1e3a8a' }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={false}
                        />
                        <Bar 
                          dataKey="count" 
                          radius={[0, 4, 4, 0]}
                          onClick={handleProvinceClick}
                          style={{ cursor: 'pointer' }}
                          isAnimationActive={false}
                          activeBar={false}
                        >
                          {provinceStats.map((entry, index) => (
                            <Cell 
                              key={index}
                              fill={`url(#provinceBarGradient-${index})`}
                              className="hover:opacity-80 transition-opacity duration-200"
                            />
                          ))}
                        </Bar>
                        <defs>
                          {provinceStats.map((entry, index) => (
                            <linearGradient
                              key={index}
                              id={`provinceBarGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#1e40af" stopOpacity={0.95} />
                              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.85} />
                            </linearGradient>
                          ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flip-card-back bg-black rounded-2xl border border-[#93c5fd]/20 shadow-lg h-full">
                  {selectedProvince && (
                    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedProvince(null);
                          setFlippedCard(null);
                        }}
                        className="flex items-center text-[#93c5fd]/80 hover:text-[#93c5fd] transition-colors duration-300 mb-6 group"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
                        返回统计
                      </button>
                      <h3 className="text-xl font-medium mb-6 bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] bg-clip-text text-transparent">
                        {selectedProvince.province}演出统计
                      </h3>
                      <div className="space-y-4">
                        {selectedProvince.performances
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((performance, index) => (
                            <div key={index} 
                              className="bg-black/80 rounded-xl p-5 border border-[#93c5fd]/10 
                                hover:border-[#93c5fd]/30 transition-all duration-300 hover:transform hover:translate-y-[-2px] 
                                hover:shadow-[0_0_20px_rgba(147,197,253,0.1)] group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-[#93c5fd] group-hover:text-[#60a5fa] transition-colors duration-300">
                                  {performance.artist}
                                </div>
                                <div className="text-sm text-[#93c5fd]/70 group-hover:text-[#60a5fa] transition-colors duration-300">
                                  {new Date(performance.date).toLocaleDateString('zh-CN')}
                                </div>
                              </div>
                              <div className="text-sm space-y-1.5 text-[#93c5fd]/70">
                                <div>城市: {performance.city || '未设置'}</div>
                                <div>场馆: {performance.venue || '未设置'}</div>
                              </div>
                              {performance.poster && (
                                <div className="mt-4 relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#93c5fd]/20 to-[#60a5fa]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <img
                                    src={getImageUrl(performance.poster)}
                                    alt="演出海报"
                                    className="w-full h-32 object-cover rounded-lg ring-1 ring-[#93c5fd]/20 group-hover:ring-[#93c5fd]/40 transition-all duration-300"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/160?text=暂无图片';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 待开发卡片 */}
            <div className="relative z-0 aspect-[4/3] bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 
              hover:border-white/20 transition-all duration-300 group hover:transform 
              hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex flex-col"
            >
              <h2 className="text-xl font-medium mb-6 flex items-center flex-shrink-0">
                <span className="bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] w-1.5 h-6 rounded-full mr-3 
                  group-hover:h-8 transition-all duration-300" 
                />
                更多统计功能开发中...
              </h2>
              <div className="flex-1 flex items-center justify-center text-[#93c5fd]/50">
                <p className="text-lg">敬请期待</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatisticsView;
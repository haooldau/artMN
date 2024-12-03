import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import PerformanceInfo from './PerformanceInfo';
import '../styles/card.css';
import API_BASE_URL from '../config/api';

const CHINA_MAP_API = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

// 辅助函数 - 投影坐标
const projectPoint = (coord, bounds) => {
  const width = 800;
  const height = 600;
  const padding = 40;
  
  const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
  const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);

  const x = padding + (coord[0] - bounds.minX) * scale;
  const y = height - (padding + (coord[1] - bounds.minY) * scale);
  
  return [x, y];
};

// 计算省份中心点函数
const getProvinceCenter = (geometry, bounds) => {
  let points = [];
  if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(polygon => {
      polygon[0].forEach(coord => {
        points.push(projectPoint(coord, bounds));
      });
    });
  } else if (geometry.type === 'Polygon') {
    geometry.coordinates[0].forEach(coord => {
      points.push(projectPoint(coord, bounds));
    });
  }
  
  const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const y = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [x, y];
};

const PerformanceMap = () => {
  const [mapData, setMapData] = useState(null);
  const [performanceData, setPerformanceData] = useState({});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistPerformances, setArtistPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 100, y: 100 });
  const [isFlipped, setIsFlipped] = useState(false);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 辅助函数 - 计算边界
  const getBounds = (features) => {
    let bounds = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };

    features.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            bounds.minX = Math.min(bounds.minX, coord[0]);
            bounds.minY = Math.min(bounds.minY, coord[1]);
            bounds.maxX = Math.max(bounds.maxX, coord[0]);
            bounds.maxY = Math.max(bounds.maxY, coord[1]);
          });
        });
      } else if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          bounds.minX = Math.min(bounds.minX, coord[0]);
          bounds.minY = Math.min(bounds.minY, coord[1]);
          bounds.maxX = Math.max(bounds.maxX, coord[0]);
          bounds.maxY = Math.max(bounds.maxY, coord[1]);
        });
      }
    });

    return bounds;
  };

  // 辅助函数 - 生成SVG路径
  const generatePath = (geometry, bounds) => {
    try {
      let pathData = '';

      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
          pathData += polygon[0].map((coord, index) => {
            const [x, y] = projectPoint(coord, bounds);
            return `${index === 0 ? 'M' : 'L'}${x},${y}`;
          }).join(' ');
          pathData += 'Z ';
        });
      } else if (geometry.type === 'Polygon') {
        pathData = geometry.coordinates[0].map((coord, index) => {
          const [x, y] = projectPoint(coord, bounds);
          return `${index === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ') + 'Z';
      }

      return pathData.trim();
    } catch (error) {
      console.error('生成路径错误:', error);
      return '';
    }
  };

  // 新增函数：按场馆对演出进行分组
  const groupPerformancesByVenue = (performances) => {
    return performances.reduce((groups, performance) => {
      const venue = performance.venue || '未设置场馆';
      if (!groups[venue]) {
        groups[venue] = [];
      }
      groups[venue].push(performance);
      return groups;
    }, {});
  };

  // 新增函数：处理艺人点击
  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    
    // 获取该艺人的所有演出信息
    const artistPerformances = [];
    Object.values(performanceData).forEach(provincePerformances => {
      provincePerformances.forEach(performance => {
        if (performance.artist === artist) {
          artistPerformances.push(performance);
        }
      });
    });
    
    setArtistPerformances(artistPerformances);
    setIsFlipped(true);
  };

  // 判断省份是否有选中艺人的演出
  const hasArtistPerformance = (provinceName) => {
    if (!selectedArtist) return false;
    return performanceData[provinceName]?.some(p => p.artist === selectedArtist);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取地图数据
        const mapResponse = await fetch(CHINA_MAP_API);
        if (!mapResponse.ok) throw new Error('获取地图数据失败');
        const mapJson = await mapResponse.json();
        setMapData(mapJson);

        // 修改 API URL
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001/api/performances'
          : '/api/performances';

        const performanceResponse = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!performanceResponse.ok) {
          const errorText = await performanceResponse.text();
          console.error('Response error:', errorText);
          throw new Error(`获取演出数据失败: ${performanceResponse.status}`);
        }

        const responseData = await performanceResponse.json();
        console.log('Performance API Response:', responseData);

        if (responseData && responseData.data) {
          const performances = responseData.data;
          console.log('原始演出数据示例:', performances[0]);
          
          const dataByProvince = {};
          
          performances.forEach(performance => {
            // 添加数据验证和日志
            if (!performance || typeof performance !== 'object') {
              console.warn('无效的演出数据:', performance);
              return;
            }

            // 检查必需字段
            const requiredFields = ['id', 'artist', 'type', 'province'];
            const missingFields = requiredFields.filter(field => !performance[field]);
            if (missingFields.length > 0) {
              console.warn(`数据缺少必需字段 ${missingFields.join(', ')}:`, performance);
              return;
            }

            let provinceName = performance.province
              .replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '')
              .trim();
            
            if (!dataByProvince[provinceName]) {
              dataByProvince[provinceName] = [];
            }
            
            // 规范化数据结构，确保日期格式正确
            try {
              const normalizedPerformance = {
                id: performance.id,
                artist: performance.artist,
                type: performance.type,
                province: provinceName,
                city: performance.city || '',
                venue: performance.venue || '',
                date: performance.date ? new Date(performance.date) : null,
                notes: performance.notes || '',
                poster: performance.poster || '',
                created_at: performance.created_at ? new Date(performance.created_at) : null
              };
              
              dataByProvince[provinceName].push(normalizedPerformance);
            } catch (error) {
              console.error('数据格式化错误:', error, performance);
            }
          });

          // 添加数据处理日志
          console.log('处理后的数据:', {
            provinceCount: Object.keys(dataByProvince).length,
            totalPerformances: Object.values(dataByProvince).reduce((sum, arr) => sum + arr.length, 0),
            sampleProvince: Object.keys(dataByProvince)[0],
            sampleData: dataByProvince[Object.keys(dataByProvince)[0]]
          });
          
          setPerformanceData(dataByProvince);
        } else {
          console.error('响应数据格式不正确:', responseData);
          throw new Error('演出数据格式不正确');
        }

      } catch (error) {
        console.error('数据获取错误:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Current performanceData:', performanceData);
  }, [performanceData]);

  const handleMapClick = (event) => {
    // 如果点击的是地图容器（而不是省份路径），清除艺人选择
    if (event.target.tagName === 'svg' || event.target.tagName === 'rect') {
      setSelectedArtist(null);
      setArtistPerformances([]);
    }
  };

  const handleProvinceClick = (feature) => {
    const provinceName = feature.properties.name
      .replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '')
      .trim();
    
    // 如果点击了不同省份，清除之前的艺人选择
    if (selectedProvince?.properties?.name !== feature.properties.name) {
      setSelectedArtist(null);
      setArtistPerformances([]);
    }
    
    setSelectedProvince({
      properties: feature.properties,
      performances: performanceData[provinceName] || []
    });
  };

  const handleDragStart = (e) => {
    // 只有点击头部才能拖动
    if (e.target.closest('.card-header')) {
      isDragging.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleDrag = (e) => {
    if (isDragging.current) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setCardPosition({ x: newX, y: newY });
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">正在加载演出数据...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
        <h3 className="text-red-500 font-semibold mb-2">数据加载失败</h3>
        <p className="text-gray-400">{error}</p>
        <div className="mt-4 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-500"
          >
            重试
          </button>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-gray-400"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );

  if (!mapData || !mapData.features) return null;

  const bounds = getBounds(mapData.features);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1a1a1a,transparent_50%)]" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto p-8">
        {/* 标题区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">演出分布</h2>
          <p className="text-gray-400">全国演出数据可视化地图</p>
        </div>

        <div className="relative">
          {/* 地图容器 */}
          <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 shadow-2xl">
            {/* 地图 SVG */}
            <svg 
              viewBox="0 0 800 600" 
              className="w-full h-auto transition-transform duration-500 hover:scale-[1.02]"
              onClick={handleMapClick}
            >
              {/* 地图网格背景 */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 20 0 L 0 0 0 20" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.03)" 
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#grid)" />

              {/* 省份路径 */}
              {mapData.features.map((feature, index) => {
                const provinceName = feature.properties.name
                  .replace(/省|自治区|维吾尔|回族|壮族|别行政区/g, '')
                  .trim();
                
                const hasPerformances = !!performanceData[provinceName]?.length;
                const isSelected = selectedProvince?.properties?.name === feature.properties.name;
                const hasArtistShow = hasArtistPerformance(provinceName);

                return (
                  <path
                    key={index}
                    d={generatePath(feature.geometry, bounds)}
                    fill={
                      hasArtistShow
                        ? '#ef4444'
                        : isSelected
                          ? '#ef4444'
                          : hasPerformances 
                            ? '#4B5563' 
                            : '#1F2937'
                    }
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                    className={`transition-all duration-300 cursor-pointer
                      ${hasPerformances ? 'hover:fill-red-500/80' : 'hover:fill-gray-600'}
                      ${isSelected ? 'shadow-lg' : ''}
                    `}
                    onClick={() => handleProvinceClick(feature)}
                  />
                );
              })}
            </svg>

            {/* 图例 */}
            <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#4B5563] rounded-full"></span>
                  <span className="text-gray-400">有演出</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-gray-400">选中地区</span>
                </div>
              </div>
            </div>
          </div>

          {/* 可拖拽的翻转卡片 */}
          {selectedProvince && (
            <div 
              className="fixed w-96 h-[600px] perspective-1000 z-50"
              style={{
                left: `${cardPosition.x}px`,
                top: `${cardPosition.y}px`,
              }}
              onMouseDown={handleDragStart}
            >
              <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* 正面 - 省份信息 */}
                <div className="absolute w-full h-full backface-hidden bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                  {/* 卡片头部 */}
                  <div className="card-header p-4 border-b border-white/10 flex justify-between items-center bg-black/50 cursor-move">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-white">
                        {selectedProvince.properties.name}演出信息
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedProvince(null)}
                      className="text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* 卡片内区域 */}
                  <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
                    <PerformanceInfo
                      performances={selectedProvince.performances}
                      onArtistClick={handleArtistClick}
                    />
                  </div>
                </div>

                {/* 背面 - 艺人信息 */}
                <div className="absolute w-full h-full backface-hidden bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden rotate-y-180">
                  {/* 艺人信息头部 */}
                  <div className="card-header p-4 border-b border-white/10 flex justify-between items-center bg-black/50 cursor-move">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setSelectedArtist(null);
                        }}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="text-xl font-semibold text-white">
                        {selectedArtist}的演出信息
                      </h3>
                    </div>
                  </div>

                  {/* 艺人演出列表 */}
                  <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
                    <div className="space-y-4">
                      {artistPerformances.map((performance, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {performance.province} {performance.city}
                                {performance.venue && ` - ${performance.venue}`}
                              </span>
                            </div>
                            {performance.notes && (
                              <div className="text-sm text-gray-400 mt-2">
                                备注: {performance.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMap;
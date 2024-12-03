import React, { useState } from 'react';
import { Calendar, MapPin, Music, Mic2, Radio, Building2, X } from 'lucide-react';
import '../styles/scrollbar.css';

const PerformanceInfo = ({ performances, onArtistClick }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // 获取演出类型的图标
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case '音乐节':
        return <Radio className="w-4 h-4" />;
      case '演唱会':
        return <Mic2 className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  // 处理场馆点击
  const handleVenueClick = (venue) => {
    const venuePerformances = performances.filter(p => p.venue === venue);
    setSelectedVenue({
      name: venue,
      performances: venuePerformances
    });
  };

  if (!performances || performances.length === 0) {
    return (
      <div className="p-4 bg-black/30 rounded-lg">
        <p className="text-gray-400 text-center">该地区暂无演出信息</p>
      </div>
    );
  }

  // 计算演出类型统计
  const performanceStats = performances.reduce((stats, performance) => {
    const type = performance.type || '其他';
    stats[type] = (stats[type] || 0) + 1;
    return stats;
  }, {});

  // 根据类型筛选演出
  const filteredPerformances = selectedType
    ? performances.filter(p => p.type === selectedType)
    : performances;

  // 按艺人分组演出
  const performancesByArtist = filteredPerformances.reduce((groups, performance) => {
    const artist = performance.artist || '未知艺人';
    if (!groups[artist]) {
      groups[artist] = [];
    }
    groups[artist].push(performance);
    return groups;
  }, {});

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      {/* 演出类型统计和筛选 */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm py-2 z-10">
        <div className="flex items-center gap-4 flex-wrap px-4">
          {Object.entries(performanceStats).map(([type, count]) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`flex items-center gap-1 text-gray-300 text-sm px-3 py-1.5 rounded-full transition-colors ${
                selectedType === type ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5'
              }`}
            >
              {getTypeIcon(type)}
              <span>{type}</span>
              <span className={`ml-1 ${selectedType === type ? 'text-red-500' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 艺人演出列表 */}
      <div className="p-4 space-y-6">
        {Object.entries(performancesByArtist).map(([artist, artistPerformances]) => (
          <div key={artist} className="space-y-4">
            <button
              type="button"
              onClick={() => onArtistClick(artist)}
              className="text-lg font-semibold text-white hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <Music className="w-5 h-5" />
              {artist}
            </button>
            <div className="space-y-4">
              {artistPerformances.map((performance, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                  <div className="space-y-3">
                    {/* 日期和演出类型 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        {getTypeIcon(performance.type)}
                        <span>{performance.type || '其他'}</span>
                      </div>
                    </div>
                    
                    {/* 地点和场馆信息 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {performance.province} {performance.city}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVenueClick(performance.venue)}
                        className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>{performance.venue}</span>
                      </button>
                    </div>

                    {/* 备注信息 */}
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
        ))}
      </div>

      {/* 场馆演出信息卡片 */}
      {selectedVenue && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="relative w-[800px] max-h-[80vh] bg-black/90 rounded-xl border border-white/10 shadow-2xl">
            {/* 卡片头部 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">{selectedVenue.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedVenue(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 卡片内容 */}
            <div className="overflow-y-auto custom-scrollbar p-4 space-y-6">
              {selectedVenue.performances.map((performance, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                  <div className="flex gap-8">
                    {/* 海报 */}
                    {performance.poster && (
                      <div className="w-1/3 flex-shrink-0">
                        <img
                          src={performance.poster ? 
                            (process.env.NODE_ENV === 'development' 
                              ? `http://localhost:3001${performance.poster}`
                              : performance.poster)
                            : 'https://via.placeholder.com/300x400?text=暂无海报'
                          }
                          alt="演出海报"
                          className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x400?text=暂无海报';
                          }}
                        />
                      </div>
                    )}

                    {/* 演出信息 */}
                    <div className="flex-1 space-y-4">
                      {/* 日期信息 */}
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                      </div>

                      {/* 地点信息 */}
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {performance.province} {performance.city}
                        </span>
                      </div>

                      {/* 场馆信息 */}
                      <div className="flex items-center gap-2 text-gray-300">
                        <Building2 className="w-4 h-4" />
                        <span>{performance.venue}</span>
                      </div>

                      {/* 阵容信息 */}
                      <div className="text-gray-300">
                        <div className="font-medium mb-1">演出阵容</div>
                        <div className="text-gray-400">{performance.artist}</div>
                      </div>

                      {/* 演出类型 */}
                      {performance.type && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-sm">
                          {getTypeIcon(performance.type)}
                          <span className="ml-1">{performance.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInfo; 
import React, { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [expandedArtist, setExpandedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [editingPerformance, setEditingPerformance] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/performances');
      if (response.data.success) {
        // 处理数据，按艺人分组
        const artistsMap = new Map();
        response.data.data.forEach(performance => {
          if (!artistsMap.has(performance.artist)) {
            artistsMap.set(performance.artist, {
              id: performance.artist,
              name: performance.artist,
              avatar: null, // 暂时没有头像数据
              latestPerformance: performance.date,
              performanceType: performance.type,
              province: performance.province,
              city: performance.city,
              venue: performance.venue,
              poster: performance.poster,
              performances: []
            });
          }
          artistsMap.get(performance.artist).performances.push(performance);
        });

        // 转换为数组并按最近演出日期排序
        const artistsArray = Array.from(artistsMap.values()).sort((a, b) => 
          new Date(b.latestPerformance) - new Date(a.latestPerformance)
        );

        setArtists(artistsArray);
      }
    } catch (err) {
      console.error('获取数据失败:', err);
      setError('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理艺人展开/收起
  const toggleArtist = (artistId) => {
    setExpandedArtist(expandedArtist === artistId ? null : artistId);
  };

  const handleDelete = async (performanceId) => {
    if (window.confirm('确定要删除这条演出记录吗？')) {
      try {
        const response = await axios.delete(`http://localhost:3001/api/performances/${performanceId}`);
        if (response.data.success) {
          // 重新获取数据
          await fetchArtists();
        }
      } catch (err) {
        console.error('删除失败:', err);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleEdit = (performance) => {
    setEditingPerformance({
      ...performance,
      date: new Date(performance.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/performances/${editingPerformance.id}`,
        editingPerformance
      );
      if (response.data.success) {
        setEditingPerformance(null);
        await fetchArtists();
      }
    } catch (err) {
      console.error('更新失败:', err);
      alert('更新失败，请稍后重试');
    }
  };

  const handleCancel = () => {
    setEditingPerformance(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a1b1e] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a1b1e] text-white">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full p-8 bg-[#1a1b1e] text-white overflow-hidden relative">
      {/* 背景光斑 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff2d2d]/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#ff2d2d]/3 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative h-full w-full max-w-7xl mx-auto bg-black/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        {/* 页面标题 */}
        <div className="p-6 pb-4 bg-gradient-to-r from-[#ff2d2d]/10 to-transparent backdrop-blur-sm border-b border-white/5 flex-none">
          <h1 className="text-2xl font-medium text-white">
            艺人列表
            <span className="ml-2 text-[#ff2d2d]/50">Artist List</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">浏览和了解我们的艺人</p>
        </div>

        {/* 表头 */}
        <div className="grid grid-cols-[auto_200px_120px_120px_120px_200px_100px_80px] px-6 py-3 text-sm text-white/70 border-b border-white/5 bg-black/60 backdrop-blur-sm sticky top-0 z-10 flex-none">
          <div>日期</div>
          <div>艺人</div>
          <div>类型</div>
          <div>省份</div>
          <div>城市</div>
          <div>场馆</div>
          <div>海报</div>
          <div>操作</div>
        </div>

        {/* 艺人列表容器 */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="h-full">
            {artists.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/60">
                暂无演出数据
              </div>
            ) : (
              <div className="h-full">
                {artists.map((artist) => (
                  <div key={artist.id} className="border-b border-white/5 last:border-b-0">
                    {/* 艺人主信息行 */}
                    <div className="grid grid-cols-[auto_200px_120px_120px_120px_200px_100px_80px] px-6 py-4 hover:bg-[#ff2d2d]/5 items-center text-sm transition-all duration-300">
                      <div>{new Date(artist.latestPerformance).toLocaleDateString('zh-CN')}</div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/40 overflow-hidden backdrop-blur-sm">
                          {artist.avatar && (
                            <img 
                              src={artist.avatar} 
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span>{artist.name}</span>
                      </div>
                      <div>
                        <span className="px-2 py-1 rounded-full bg-black/40 text-xs backdrop-blur-sm">
                          {artist.performanceType}
                        </span>
                      </div>
                      <div>{artist.province}</div>
                      <div>{artist.city}</div>
                      <div>{artist.venue}</div>
                      <div>
                        {artist.poster ? (
                          <img 
                            src={`http://localhost:3001${artist.poster}`}
                            alt="演出海报"
                            className="w-10 h-10 rounded object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-white/40 text-xs backdrop-blur-sm">
                            无图
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => toggleArtist(artist.id)}
                          className={`p-2 rounded-full hover:bg-[#ff2d2d]/10 transition-all duration-300 ${
                            expandedArtist === artist.id ? 'bg-[#ff2d2d]/20' : ''
                          }`}
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-300 ${
                              expandedArtist === artist.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 展开的演出列表 */}
                    {expandedArtist === artist.id && (
                      <div className="bg-black/40 backdrop-blur-md">
                        {artist.performances.map((performance, idx) => (
                          <div 
                            key={idx}
                            className="grid grid-cols-[auto_200px_120px_120px_120px_200px_100px_80px] px-6 py-4 text-sm text-white/80 border-t border-white/5 relative group hover:bg-[#ff2d2d]/5 transition-all duration-300"
                            onMouseEnter={() => setSelectedPerformance(performance.id)}
                            onMouseLeave={() => setSelectedPerformance(null)}
                          >
                            {editingPerformance?.id === performance.id ? (
                              <div className="col-span-8 bg-black/60 backdrop-blur-xl p-6 border border-white/10 rounded-lg m-2">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-medium">编辑演出信息</h3>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleUpdate}
                                      className="px-4 py-2 rounded-full bg-[#ff2d2d]/10 hover:bg-[#ff2d2d]/20 text-white flex items-center gap-2 transition-all duration-300"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>保存</span>
                                    </button>
                                    <button
                                      onClick={handleCancel}
                                      className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 flex items-center gap-2 transition-all duration-300"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>取消</span>
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">日期</label>
                                    <input
                                      type="date"
                                      value={editingPerformance.date}
                                      onChange={(e) => setEditingPerformance({
                                        ...editingPerformance,
                                        date: e.target.value
                                      })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">类型</label>
                                    <select
                                      value={editingPerformance.type}
                                      onChange={(e) => setEditingPerformance({
                                        ...editingPerformance,
                                        type: e.target.value
                                      })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white appearance-none cursor-pointer transition-all duration-300"
                                      style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1em 1em',
                                        paddingRight: '2.5rem'
                                      }}
                                    >
                                      <option value="演唱会" className="bg-black/90">演唱会</option>
                                      <option value="音乐节" className="bg-black/90">音乐节</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">省份</label>
                                    <input
                                      type="text"
                                      value={editingPerformance.province}
                                      onChange={(e) => setEditingPerformance({
                                        ...editingPerformance,
                                        province: e.target.value
                                      })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">城市</label>
                                    <input
                                      type="text"
                                      value={editingPerformance.city}
                                      onChange={(e) => setEditingPerformance({
                                        ...editingPerformance,
                                        city: e.target.value
                                      })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">场馆</label>
                                    <input
                                      type="text"
                                      value={editingPerformance.venue}
                                      onChange={(e) => setEditingPerformance({
                                        ...editingPerformance,
                                        venue: e.target.value
                                      })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff2d2d]/50 backdrop-blur-sm text-white transition-all duration-300"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm text-white/60 block">海报</label>
                                    <div className="flex items-center gap-4">
                                      {performance.poster ? (
                                        <img 
                                          src={`http://localhost:3001${performance.poster}`}
                                          alt="演出海报"
                                          className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/40 text-xs">
                                          无图
                                        </div>
                                      )}
                                      <input
                                        type="file"
                                        onChange={(e) => setEditingPerformance({
                                          ...editingPerformance,
                                          newPoster: e.target.files?.[0]
                                        })}
                                        className="hidden"
                                        id="poster-upload"
                                      />
                                      <label 
                                        htmlFor="poster-upload"
                                        className="px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 cursor-pointer transition-all duration-300 text-sm"
                                      >
                                        更换海报
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // 显示模式
                              <>
                                <div>{new Date(performance.date).toLocaleDateString('zh-CN')}</div>
                                <div></div>
                                <div>
                                  <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs">
                                    {performance.type}
                                  </span>
                                </div>
                                <div>{performance.province}</div>
                                <div>{performance.city}</div>
                                <div>{performance.venue}</div>
                                <div>
                                  {performance.poster ? (
                                    <img 
                                      src={`http://localhost:3001${performance.poster}`}
                                      alt="演出海报"
                                      className="w-10 h-10 rounded object-cover ring-1 ring-white/10"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/40 text-xs">
                                      无图
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {selectedPerformance === performance.id && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
                                      <button
                                        onClick={() => handleEdit(performance)}
                                        className="p-1.5 rounded-full hover:bg-[#ff2d2d]/10 text-white/80 transition-all duration-300"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(performance.id)}
                                        className="p-1.5 rounded-full hover:bg-[#ff2d2d]/10 text-white/80 transition-all duration-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistList;
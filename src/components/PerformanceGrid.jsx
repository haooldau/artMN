import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ChevronLeft } from 'lucide-react';

const PerformanceGrid = ({ performances }) => {
  const [expandedArtist, setExpandedArtist] = useState(null);
  const containerRef = useRef(null);
  const [bubbles, setBubbles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef();
  const lastUpdateTime = useRef(Date.now());
  const isAnimating = useRef(true);

  // 获取所有艺人及其演出次数
  const getArtistStats = () => {
    const stats = performances.reduce((acc, perf) => {
      if (!perf.artist) return acc;
      if (!acc[perf.artist]) {
        acc[perf.artist] = 0;
      }
      acc[perf.artist]++;
      return acc;
    }, {});

    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([artist, count]) => ({
        artist,
        count,
        size: Math.max(Math.min(count * 20, 120), 40)
      }));
  };

  // 获取艺人的所有演出
  const getArtistPerformances = (artist) => {
    return performances
      .filter(perf => perf.artist === artist)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(perf => ({
        ...perf,
        date: new Date(perf.date)
      }));
  };

  // 生成蓝色系颜色
  const generateBlueShade = (count, maxCount) => {
    const saturation = 60 + (count / maxCount) * 40;
    const lightness = 60 - (count / maxCount) * 30;
    return `hsl(210, ${saturation}%, ${lightness}%)`;
  };

  // 初始化气泡位置
  const initializeBubbles = () => {
    if (!containerRef.current) return;

    const artistStats = getArtistStats();
    const maxCount = Math.max(...artistStats.map(a => a.count));
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const padding = 20;

    const newBubbles = artistStats.map(artist => ({
      ...artist,
      x: Math.random() * (containerWidth - artist.size - padding * 2) + padding,
      y: Math.random() * (containerHeight - artist.size - padding * 2) + padding,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      color: generateBlueShade(artist.count, maxCount),
      phase: Math.random() * Math.PI * 2
    }));

    setBubbles(newBubbles);
  };

  // 更新气泡位置
  const updateBubbles = () => {
    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - lastUpdateTime.current) / 16, 2);
    lastUpdateTime.current = currentTime;

    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const mouseInfluenceRadius = 150;
    const mouseForce = 0.8;

    setBubbles(prevBubbles => {
      return prevBubbles.map(bubble => {
        let { x, y, vx, vy, size, phase } = bubble;
        const padding = 20;

        // 更新相位
        phase = (phase + deltaTime * 0.01) % (Math.PI * 2);

        // 自然运动
        const time = currentTime * 0.0005;
        const floatX = Math.sin(phase + time) * 0.15;
        const floatY = Math.cos(phase + time * 0.8) * 0.15;

        // 鼠标影响
        const dx = mousePos.x - containerRect.left - x - size/2;
        const dy = mousePos.y - containerRect.top - y - size/2;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distanceToMouse < mouseInfluenceRadius) {
          const force = Math.pow(1 - distanceToMouse / mouseInfluenceRadius, 2) * mouseForce;
          const angle = Math.atan2(dy, dx);
          vx -= Math.cos(angle) * force;
          vy -= Math.sin(angle) * force;
        }

        // 更新位置
        vx += floatX * 0.4;
        vy += floatY * 0.4;
        x += vx * 0.6;
        y += vy * 0.6;

        // 边界检查
        if (x < padding) {
          x = padding;
          vx *= -0.3;
        }
        if (x > containerWidth - size - padding) {
          x = containerWidth - size - padding;
          vx *= -0.3;
        }
        if (y < padding) {
          y = padding;
          vy *= -0.3;
        }
        if (y > containerHeight - size - padding) {
          y = containerHeight - size - padding;
          vy *= -0.3;
        }

        // 阻力
        vx *= 0.98;
        vy *= 0.98;

        return {
          ...bubble,
          x,
          y,
          vx,
          vy,
          phase
        };
      });
    });

    animationFrameRef.current = requestAnimationFrame(updateBubbles);
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 修改返回按钮的处理函数
  const handleReturn = () => {
    setExpandedArtist(null);
    // 确保动画继续运行
    if (!animationFrameRef.current && isAnimating.current) {
      lastUpdateTime.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateBubbles);
    }
  };

  // 修改 useEffect
  useEffect(() => {
    initializeBubbles();
    const handleResize = () => initializeBubbles();
    window.addEventListener('resize', handleResize);

    // 开始动画
    lastUpdateTime.current = Date.now();
    isAnimating.current = true;
    animationFrameRef.current = requestAnimationFrame(updateBubbles);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [performances]);

  // 在展开艺人详情时暂停动画
  useEffect(() => {
    if (expandedArtist) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      // 返回时重新开始动画
      if (!animationFrameRef.current && isAnimating.current) {
        lastUpdateTime.current = Date.now();
        animationFrameRef.current = requestAnimationFrame(updateBubbles);
      }
    }
  }, [expandedArtist]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isAnimating.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  if (expandedArtist) {
    const artistPerformances = getArtistPerformances(expandedArtist);

    // 阻止滚动事件冒泡
    const handleScroll = (e) => {
      e.stopPropagation();
    };

    return (
      <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回艺人分布</span>
          </button>
          <div className="text-lg font-medium">{expandedArtist}</div>
        </div>

        {/* 演出列表容器 */}
        <div className="flex-1 relative">
          {/* 固定高度的滚动容器 */}
          <div 
            className="absolute inset-0 overflow-y-auto custom-scrollbar"
            onWheel={handleScroll}
            onTouchMove={handleScroll}
          >
            <div className="p-4 space-y-4">
              {artistPerformances.map((perf, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(perf.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {perf.province} {perf.city}
                        {perf.venue && ` · ${perf.venue}`}
                      </span>
                    </div>
                    {perf.type && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                        {perf.type}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: -1000, y: -1000 })}
    >
      {bubbles.map((bubble) => (
        <button
          key={bubble.artist}
          onClick={() => setExpandedArtist(bubble.artist)}
          className="absolute rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
          style={{
            width: bubble.size,
            height: bubble.size,
            transform: `translate(${bubble.x}px, ${bubble.y}px)`,
            backgroundColor: bubble.color,
            fontSize: `${Math.max(bubble.size / 8, 12)}px`,
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <div className="text-center p-2">
            <div className="font-medium text-white truncate px-2">
              {bubble.artist}
            </div>
            <div className="text-xs text-white/80">
              {bubble.count}场演出
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PerformanceGrid;
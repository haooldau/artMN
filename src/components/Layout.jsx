import React, { useState, useEffect, useRef } from 'react';
import { Map, Calendar, Users, RefreshCw, Menu, X, BarChart, Home, Search } from 'lucide-react';
import ReactFullpage from '@fullpage/react-fullpage';
import PerformanceMap from './PerformanceMap.jsx';
import UpdateForm from './UpdateForm';
import ArtistList from './ArtistList';
import StatisticsView from './StatisticsView';
import RecentPerformances from './RecentPerformances';
import HomePage from './HomePage';

const Layout = () => {
  const [activeItem, setActiveItem] = useState('主页');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSunEmoji, setShowSunEmoji] = useState(false);
  const fullpageApiRef = useRef(null);

  const menuItems = [
    { name: '主页', icon: Home },
    { name: '演出分布', icon: Map },
    { name: '近期演出', icon: Calendar },
    { name: '艺人', icon: Users },
    { name: '统计', icon: BarChart },
    { name: '更新数据', icon: RefreshCw },
  ];

  const getBackgroundColor = (section) => {
    return section === '主页' ? 'bg-black' : 'bg-[#1C1C1E]';
  };

  const renderSection = (name) => {
    switch (name) {
      case '主页':
        return <HomePage />;
      case '演出分布':
        return <PerformanceMap />;
      case '近期演出':
        return <RecentPerformances />;
      case '艺人':
        return <ArtistList />;
      case '统计':
        return <StatisticsView />;
      case '更新数据':
        return <UpdateForm />;
      default:
        return <HomePage />;
    }
  };

  const handleMenuClick = (itemName) => {
    const index = menuItems.findIndex(item => item.name === itemName);
    if (fullpageApiRef.current) {
      try {
        fullpageApiRef.current.moveTo(index + 1);
        setActiveItem(itemName);
      } catch (error) {
        console.error('Error moving to section:', error);
      }
    }
  };

  const handleSignatureClick = () => {
    setShowSunEmoji(true);
    
    // 创建6颗太阳
    for (let i = 0; i < 6; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = '☀️';
      emoji.style.position = 'fixed';
      emoji.style.left = '80px';
      emoji.style.bottom = '60px';
      emoji.style.fontSize = '24px';
      emoji.style.zIndex = '100';
      emoji.style.transition = 'all 0.8s ease-out';
      emoji.style.transform = 'translateY(0) rotate(0deg)';
      document.body.appendChild(emoji);

      // 为每颗太阳设置不同的动画路径
      setTimeout(() => {
        const angle = (i * 60) - 30; // -30到270度，每颗相差60度
        const distance = 100 + Math.random() * 50; // 100-150px的随机距离
        const rotation = 180 + Math.random() * 360; // 180-540度的随机旋转
        
        emoji.style.transform = `
          translate(
            ${distance * Math.cos(angle * Math.PI / 180)}px,
            ${-distance * Math.sin(angle * Math.PI / 180)}px
          ) 
          rotate(${rotation}deg)
        `;
        emoji.style.opacity = '0';
      }, 50);

      // 移除元素
      setTimeout(() => {
        document.body.removeChild(emoji);
        if (i === 5) {
          setShowSunEmoji(false);
        }
      }, 850);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="ml-4 text-white text-xl font-semibold flex items-center">
            <img 
              src="/logo192.png" 
              alt="SparkleLive Logo" 
              className="w-8 h-8 object-contain mr-2" 
            />
            SparkleLive
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-white/10"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
            Log in
          </button>
        </div>
      </div>

      {/* 侧边导航栏 */}
      <div 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-black/90 backdrop-blur-md transform transition-transform duration-300 ease-in-out border-r border-white/5 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '16rem' }}
      >
        <div className="h-full flex flex-col">
          <nav className="flex-1 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.name)}
                className={`w-full flex items-center px-6 py-3 text-base transition-colors ${
                  activeItem === item.name
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
          {/* 署名和彩蛋 */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleSignatureClick}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer select-none"
            >
              by: chen
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 - Fullpage */}
      <ReactFullpage
        scrollingSpeed={700}
        navigation={false}
        css3={true}
        easingcss3="cubic-bezier(0.645, 0.045, 0.355, 1)"
        onLeave={(origin, destination) => {
          setActiveItem(menuItems[destination.index].name);
        }}
        render={({ state, fullpageApi }) => {
          if (fullpageApi && !fullpageApiRef.current) {
            fullpageApiRef.current = fullpageApi;
          }
          
          return (
            <ReactFullpage.Wrapper>
              {menuItems.map((item, index) => (
                <div key={index} className="section bg-black">
                  <div 
                    className={`w-full min-h-screen ${
                      isSidebarOpen ? 'pl-64' : 'pl-0'
                    } pt-16`}
                  >
                    {renderSection(item.name)}
                  </div>
                </div>
              ))}
            </ReactFullpage.Wrapper>
          );
        }}
      />

      {/* 全局样式 */}
      <style jsx global>{`
        .card {
          @apply bg-black rounded-xl p-6 border border-white/5;
        }
        .btn-primary {
          @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors;
        }
        .btn-secondary {
          @apply bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors;
        }
        /* 隐藏 fullpage.js 的默认导航点 */
        #fp-nav {
          display: none;
        }
        /* 自定义滚动动画 */
        .fp-section {
          transition: all 700ms cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .fp-section.active {
          transform: scale(1);
          opacity: 1;
        }
        .fp-section:not(.active) {
          transform: scale(0.98);
          opacity: 0.8;
        }
        /* 修复内容溢出问题 */
        .fp-overflow {
          height: 100%;
        }
        .section {
          height: 100vh !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Layout;
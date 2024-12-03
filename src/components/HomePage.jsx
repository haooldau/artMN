import React from 'react';

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* 红色光斑效果 */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[128px]" />
      
      {/* 主要内容 */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl">
          <div className="mb-2">
            <span className="inline-block text-red-500">•</span>
            <span className="ml-2 text-gray-300">Online</span>
          </div>
          <h1 className="text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            From<br />
            SparkleLive team<br />
            Make it easy.
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mb-8 leading-relaxed">
            一个艺人数据管理平台，让艺人管理变得简单.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg flex items-center group transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
            See the plans
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 右侧装饰圆圈 */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] border border-white/5 rounded-full" />
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] border border-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] border border-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default HomePage; 
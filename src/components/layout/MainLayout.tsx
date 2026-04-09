import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    // 在 HashRouter 中，location.hash 格式为 #/path#anchor
    // 例如：/#/#origins 表示路径是 /，页面内锚点是 #origins
    if (!location.hash) return;

    // 解析 hash，提取页面内锚点
    // 格式可能是: #/path 或 #/path#anchor 或 #/#anchor
    const hashValue = location.hash.slice(1); // 移除开头的 #
    
    // 查找第二个 # 后面的内容（页面内锚点）
    const secondHashIndex = hashValue.indexOf('#', 1);
    let id = '';
    
    if (secondHashIndex !== -1) {
      // 有页面内锚点，如 #/#origins
      id = hashValue.slice(secondHashIndex + 1);
    } else if (hashValue.startsWith('/#')) {
      // 格式为 /#anchor
      id = hashValue.slice(2);
    } else if (hashValue === '/' || hashValue === '') {
      // 首页，不需要滚动
      return;
    }

    if (!id) return;

    // Wait for route content to render
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const header = document.querySelector('header[data-cmp="Header"]');
        const headerHeight = header ? (header as HTMLElement).offsetHeight || 80 : 80;
        
        const elementRect = el.getBoundingClientRect();
        const scrollTo = window.pageYOffset + elementRect.top - headerHeight;
        
        window.scrollTo({
          top: scrollTo,
          behavior: 'smooth'
        });
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <div data-cmp="MainLayout" className="min-h-screen w-full bg-background">
      <div className="w-full relative flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        {/* Spacer for fixed header */}
        <div className="h-20" />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import SectionTitle from '../components/ui-custom/SectionTitle';
import { readHomePageData, type HomePageDataOrEmpty } from '@modules/pages/home';

const History: React.FC = () => {
  const [data, setData] = React.useState<HomePageDataOrEmpty>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    readHomePageData().then((next) => {
      if (alive) {
        setData(next);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20 px-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 px-20 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">暂无历史数据</h2>
          <p className="text-muted-foreground">请先录入数据以展示家族历史</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-20 min-h-[60vh] flex flex-col items-center">
      <SectionTitle title={data?.hero?.title || ''} subtitle={data?.hero?.subtitle || ''} />
      <div className="max-w-3xl text-center mt-10">
        <div
          className="text-xl text-muted-foreground leading-relaxed mb-6"
          dangerouslySetInnerHTML={{ __html: data?.hero?.description || '' }}
        />
      </div>
    </div>
  );
};

export default History;
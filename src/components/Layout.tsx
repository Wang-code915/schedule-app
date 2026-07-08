import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Sidebar />
      {/* 桌面端：左侧留边距；移动端：顶部留标题栏空间 */}
      <main className="md:ml-56 md:p-6 pt-16 px-4 pb-4">
        {title && (
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

import { Calendar, Users, ListChecks, DollarSign } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { icon: Calendar, label: '日历', path: '/' },
  { icon: Users, label: '学生', path: '/students' },
  { icon: ListChecks, label: '批量', path: '/batch-schedule' },
  { icon: DollarSign, label: '薪资', path: '/salary' },
];

export const Sidebar = () => {
  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-primary-800 text-white z-50 flex-col">
        <div className="p-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">排课系统</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-primary-700">
          <button
            className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white/70 transition-colors"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            <span className="text-xs">重置数据</span>
          </button>
        </div>
      </aside>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <ul className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 移动端顶部标题栏 */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-primary-800 text-white z-40 flex items-center px-4">
        <Calendar className="w-5 h-5 mr-2" />
        <span className="font-bold">排课系统</span>
      </header>
    </>
  );
};

import { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getMonthRange, toDateStr, todayStr } from '@/utils/format';

export const SalaryPage = () => {
  const { state } = useApp();
  const { courses, students } = state;

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const today = todayStr();
  const monthStart = getMonthRange(selectedMonth).start;
  const monthEnd = getMonthRange(selectedMonth).end;

  const todayCourses = courses.filter((c) => c.date === today);
  const monthCourses = courses.filter(
    (c) => c.date >= toDateStr(monthStart) && c.date <= toDateStr(monthEnd)
  );

  const todayIncome = todayCourses.reduce((sum, c) => sum + c.rate, 0);
  const monthIncome = monthCourses.reduce((sum, c) => sum + c.rate, 0);

  const prepaidStudents = students.filter((s) => s.type === 'prepaid');
  const postpaidStudents = students.filter((s) => s.type === 'postpaid');

  const prepaidIncome = monthCourses.reduce((sum, c) => {
    const student = students.find((s) => s.id === c.studentId);
    return student?.type === 'prepaid' ? sum + c.rate : sum;
  }, 0);

  const postpaidIncome = monthCourses.reduce((sum, c) => {
    const student = students.find((s) => s.id === c.studentId);
    return student?.type === 'postpaid' ? sum + c.rate : sum;
  }, 0);

  const totalPendingAmount = postpaidStudents.reduce((sum, s) => sum + s.pendingAmount, 0);

  const getDailyIncome = () => {
    const dailyMap = new Map<string, number>();
    monthCourses.forEach((course) => {
      dailyMap.set(course.date, (dailyMap.get(course.date) || 0) + course.rate);
    });
    return Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7);
  };

  const dailyIncome = getDailyIncome();
  const maxDailyIncome = Math.max(...dailyIncome.map(([, amount]) => amount), 1);

  const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
  const prevMonthStart = getMonthRange(prevMonth).start;
  const prevMonthEnd = getMonthRange(prevMonth).end;
  const prevMonthCourses = courses.filter(
    (c) =>
      c.date >= toDateStr(prevMonthStart) &&
      c.date <= toDateStr(prevMonthEnd)
  );
  const prevMonthIncome = prevMonthCourses.reduce((sum, c) => sum + c.rate, 0);

  const monthChange = monthIncome - prevMonthIncome;
  const monthChangePercent = prevMonthIncome > 0 ? (monthChange / prevMonthIncome) * 100 : 0;

  return (
    <Layout title="薪资统计">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-600">今日收入</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {formatCurrency(todayIncome)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                共 {todayCourses.length} 节课
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-600 text-sm md:text-base">
                    {selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月收入
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
                  }
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  上月
                </button>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-gray-800">
                  {formatCurrency(monthIncome)}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    monthChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {monthChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(monthChangePercent).toFixed(1)}%
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                共 {monthCourses.length} 节课
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">近7日收入趋势</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end justify-between h-48 gap-4">
              {dailyIncome.map(([date, amount]) => (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2">
                      {formatCurrency(amount)}
                    </span>
                    <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(amount / maxDailyIncome) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {date.split('-').slice(1).join('/')}
                  </span>
                </div>
              ))}
              {dailyIncome.length === 0 && (
                <div className="text-center text-gray-400 py-8">本月暂无收入数据</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">本月课程明细</h3>
            {monthCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">暂无课程记录</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {monthCourses
                  .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
                  .map((course) => {
                    const student = students.find((s) => s.id === course.studentId);
                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                              student?.type === 'prepaid'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-orange-100 text-orange-600'
                            }`}
                          >
                            {student?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {student?.name}
                              <span
                                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                  student?.type === 'prepaid'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {student?.type === 'prepaid' ? '预付费' : '后付费'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.date} {course.startTime}-{course.endTime}
                            </div>
                          </div>
                        </div>
                        <span className="text-primary-600 font-semibold">
                          +{formatCurrency(course.rate)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">收入构成</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">预付费收入</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(prepaidIncome)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${monthIncome > 0 ? (prepaidIncome / monthIncome) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">后付费收入</span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatCurrency(postpaidIncome)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 rounded-full h-2 transition-all"
                    style={{ width: `${monthIncome > 0 ? (postpaidIncome / monthIncome) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">待结算金额</h3>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 mb-1">后付费学生待结算</div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(totalPendingAmount)}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {postpaidStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="text-gray-700">{student.name}</span>
                  <span className="text-orange-600 font-medium">
                    {formatCurrency(student.pendingAmount)}
                  </span>
                </div>
              ))}
              {postpaidStudents.length === 0 && (
                <p className="text-gray-400 text-center py-2">暂无后付费学生</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">学生统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {prepaidStudents.length}
                </div>
                <div className="text-sm text-green-700">预付费学生</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {postpaidStudents.length}
                </div>
                <div className="text-sm text-orange-700">后付费学生</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

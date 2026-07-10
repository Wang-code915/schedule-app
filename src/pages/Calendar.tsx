import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Modal } from '@/components/Modal';
import { useApp } from '@/contexts/AppContext';
import { formatDate, getWeekday, getMonthDays, toDateStr, todayStr } from '@/utils/format';
import { formatCurrency } from '@/utils/format';

export const CalendarPage = () => {
  const { state, setSelectedDate, addCourse, deleteCourse } = useApp();
  const { students, courses, selectedDate } = state;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    studentId: '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '10:00',
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getMonthDays(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    setCourseForm((prev) => ({ ...prev, date: dateStr }));
  };

  const today = todayStr();

  const dayCourses = courses.filter((c) => c.date === selectedDate);
  const sortedCourses = [...dayCourses].sort(
    (a, b) => a.startTime.localeCompare(b.startTime)
  );

  const dayTotalIncome = sortedCourses.reduce((sum, c) => sum + c.rate, 0);

  const getStudent = (id: string) => students.find((s) => s.id === id);

  const handleSubmit = () => {
    const student = getStudent(courseForm.studentId);
    if (!student) return;

    if (student.type === 'prepaid' && student.remainingHours <= 0) {
      alert('该学生课时不足');
      return;
    }

    addCourse({
      studentId: courseForm.studentId,
      date: courseForm.date,
      startTime: courseForm.startTime,
      endTime: courseForm.endTime,
      rate: student.hourlyRate,
    });

    setShowAddModal(false);
    setCourseForm({
      studentId: '',
      date: selectedDate,
      startTime: '09:00',
      endTime: '10:00',
    });
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourseForm((prev) => ({ ...prev, studentId: e.target.value }));
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('确定要删除这节课吗？')) {
      deleteCourse(courseId);
    }
  };

  return (
    <Layout title="排课日历">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                  {year}年{month + 1}月
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加课程
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={i} className="h-10 md:h-16" />
              ))}
              {days.map((date) => {
                const dateStr = toDateStr(date);
                const hasCourses = courses.some((c) => c.date === dateStr);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(date)}
                    className={`relative h-10 md:h-16 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : isToday
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block text-center text-xs md:text-sm font-medium">
                      {date.getDate()}
                    </span>
                    {hasCourses && (
                      <span
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-primary-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mt-4 md:mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                {formatDate(selectedDate)} {getWeekday(selectedDate)}
              </h3>
              <span className="text-sm text-gray-500">
                共 {sortedCourses.length} 节课
              </span>
            </div>

            {sortedCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>当天暂无课程安排</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  添加课程
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCourses.map((course) => {
                  const student = getStudent(course.studentId);
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold">
                          {student?.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {student?.name}
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                student?.type === 'prepaid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {student?.type === 'prepaid' ? '预付费' : '后付费'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {course.startTime} - {course.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-primary-600">
                          {formatCurrency(course.rate)}
                        </span>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dayTotalIncome > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">当日收入</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(dayTotalIncome)}
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="添加课程">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择学生</label>
            <select
              value={courseForm.studentId}
              onChange={handleStudentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">请选择学生</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                  {student.type === 'prepaid' && ` (剩余${student.remainingHours}课时)`}
                  {student.type === 'postpaid' && ' (后付费)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={courseForm.date}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input
                type="time"
                value={courseForm.startTime}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="time"
                value={courseForm.endTime}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          {courseForm.studentId && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                每节课费用：{' '}
                <span className="font-semibold text-primary-600">
                  {formatCurrency(
                    students.find((s) => s.id === courseForm.studentId)?.hourlyRate || 0
                  )}
                </span>
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!courseForm.studentId}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认排课
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

import { useState } from 'react';
import { Check, Clock, Calendar, ChevronDown, UserPlus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, toDateStr } from '@/utils/format';

export const BatchSchedulePage = () => {
  const { state, addBatchCourses } = useApp();
  const { students } = state;

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    startTime: '09:00',
    endTime: '10:00',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const currentStudent = students.find((s) => s.id === selectedStudent);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean; isSelected: boolean }[] = [];

    const prevMonthDays = firstDay;
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: toDateStr(d),
        day: d.getDate(),
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = toDateStr(d);
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isSelected: selectedDates.includes(dateStr),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: toDateStr(d),
        day: i,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    return days;
  };

  const handleSelectDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleSelectAllDates = () => {
    const days = getDaysInMonth(calendarDate);
    const currentMonthDates = days.filter((d) => d.isCurrentMonth).map((d) => d.date);
    
    if (selectedDates.length === currentMonthDates.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates(currentMonthDates);
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSubmit = () => {
    if (!selectedStudent) {
      alert('请选择一位学生');
      return;
    }

    if (selectedDates.length === 0) {
      alert('请至少选择一个日期');
      return;
    }

    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;

    if (student.type === 'prepaid' && student.remainingHours < selectedDates.length) {
      alert(`${student.name}剩余${student.remainingHours}课时，无法安排${selectedDates.length}节课`);
      return;
    }

    const courses = selectedDates.map((date) => ({
      studentId: selectedStudent,
      date,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      rate: student.hourlyRate,
    }));

    addBatchCourses(courses);
    setSelectedDates([]);
    alert(`成功为${student.name}安排${courses.length}节课`);
  };

  const estimatedTotalIncome = currentStudent
    ? currentStudent.hourlyRate * selectedDates.length
    : 0;

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <Layout title="批量排课">
      <div className="space-y-4 md:space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">选择学生</h3>
          
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无学生，请先添加学生</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {students.map((student) => {
                const isSelected = selectedStudent === student.id;
                const canSchedule =
                  student.type === 'postpaid' || student.remainingHours > 0;

                return (
                  <div
                    key={student.id}
                    onClick={() => canSchedule && setSelectedStudent(isSelected ? null : student.id)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!canSchedule ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${
                          student.type === 'prepaid'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary-600" />}
                    </div>
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-500">
                      {student.type === 'prepaid'
                        ? `剩余${student.remainingHours}课时`
                        : '后付费'}
                    </div>
                    <div className="text-sm text-gray-500">
                      课时费 {formatCurrency(student.hourlyRate)}/节
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">选择日期</h3>
              <button
                onClick={handleSelectAllDates}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {selectedDates.length > 0 ? '取消全选' : '全选本月'}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
              </button>
              <h4 className="text-lg font-semibold text-gray-800">
                {calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}月
              </h4>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-gray-600 -rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(calendarDate).map(({ date, day, isCurrentMonth, isSelected }) => (
                <button
                  key={date}
                  onClick={() => isCurrentMonth && handleSelectDate(date)}
                  disabled={!isCurrentMonth}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : isCurrentMonth
                      ? 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      : 'bg-transparent text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">已选日期</span>
                  <span className="text-sm text-gray-500">({selectedDates.length}天)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date) => (
                    <span
                      key={date}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {date.slice(5)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">时间设置</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {selectedDates.length > 0 && (
              <div className="p-4 bg-primary-50 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-primary-700">预估收入</span>
                </div>
                <div className="text-2xl font-bold text-primary-600">
                  {formatCurrency(estimatedTotalIncome)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {currentStudent?.name} × {selectedDates.length}节课 × {formatCurrency(currentStudent?.hourlyRate || 0)}/节
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={selectedDates.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              确认批量排课 ({selectedDates.length}节)
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

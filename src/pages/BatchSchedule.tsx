import { useState } from 'react';
import { Check, Clock, UserPlus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/format';

export const BatchSchedulePage = () => {
  const { state, addBatchCourses } = useApp();
  const { students } = state;

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });

  const handleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = () => {
    if (selectedStudentIds.length === 0) {
      alert('请至少选择一位学生');
      return;
    }

    const courses = selectedStudentIds.map((studentId) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return null;

      if (student.type === 'prepaid' && student.remainingHours <= 0) {
        alert(`${student.name}课时不足，无法排课`);
        return null;
      }

      return {
        studentId,
        date: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        rate: student.hourlyRate,
      };
    }).filter(Boolean);

    if (courses.length > 0) {
      addBatchCourses(courses as { studentId: string; date: string; startTime: string; endTime: string; rate: number }[]);
      setSelectedStudentIds([]);
      alert(`成功为${courses.length}位学生排课`);
    }
  };

  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
  const estimatedTotalIncome = selectedStudents.reduce((sum, s) => sum + s.hourlyRate, 0);

  return (
    <Layout title="批量排课">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">选择学生</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.length === students.length && students.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-600">全选</span>
              </label>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无学生，请先添加学生</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const canSchedule =
                    student.type === 'postpaid' || student.remainingHours > 0;

                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!canSchedule ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => canSchedule && handleSelectStudent(student.id)}
                        disabled={!canSchedule}
                        className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                      />
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${
                          student.type === 'prepaid'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {student.name}
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              student.type === 'prepaid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {student.type === 'prepaid' ? '预付费' : '后付费'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.type === 'prepaid'
                            ? `剩余${student.remainingHours}课时`
                            : '后付费'}
                          <span className="mx-2">|</span>
                          课时费 {formatCurrency(student.hourlyRate)}/节
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:sticky lg:top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">排课设置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">已选学生</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl font-bold text-primary-600">
                    {selectedStudentIds.length}
                  </span>
                  <span className="text-sm text-gray-600">位学生</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">课程日期</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              {selectedStudentIds.length > 0 && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-700">预估收入</span>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(estimatedTotalIncome)}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={selectedStudentIds.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                确认批量排课
              </button>
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">已选学生列表</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${
                            student.type === 'prepaid'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-gray-700">{student.name}</span>
                      </div>
                      <span className="text-primary-600 font-medium">
                        {formatCurrency(student.hourlyRate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

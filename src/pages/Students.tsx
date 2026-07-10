import { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign, User, Calendar, ChevronDown, Check, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Modal } from '@/components/Modal';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, toDateStr, getMonthRange } from '@/utils/format';
import { StudentType, Course } from '@/types';

export const StudentsPage = () => {
  const { state, addStudent, updateStudent, deleteStudent, deleteBatchCourses, addBatchCourses } = useApp();
  const { students, courses } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    type: 'prepaid' as StudentType,
    remainingHours: 0,
    hourlyRate: 0,
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [detailMonth, setDetailMonth] = useState(new Date());
  const [showBatchScheduleModal, setShowBatchScheduleModal] = useState(false);
  const [batchScheduleForm, setBatchScheduleForm] = useState({
    startTime: '09:00',
    endTime: '10:00',
    selectedDates: [] as string[],
    calendarDate: new Date(),
  });

  const handleOpenAddModal = () => {
    setStudentForm({ name: '', type: 'prepaid', remainingHours: 0, hourlyRate: 0 });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (student: typeof students[0]) => {
    setSelectedStudent(student);
    setStudentForm({
      name: student.name,
      type: student.type,
      remainingHours: student.remainingHours,
      hourlyRate: student.hourlyRate,
    });
    setShowEditModal(true);
  };

  const handleOpenDetailModal = (student: typeof students[0]) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleSubmitAdd = () => {
    if (!studentForm.name || studentForm.hourlyRate <= 0) {
      alert('请填写完整信息');
      return;
    }
    addStudent(studentForm);
    setShowAddModal(false);
  };

  const handleSubmitEdit = () => {
    if (!selectedStudent || !studentForm.name || studentForm.hourlyRate <= 0) {
      alert('请填写完整信息');
      return;
    }
    updateStudent({
      ...selectedStudent,
      ...studentForm,
    });
    setShowEditModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该学生吗？')) {
      deleteStudent(id);
    }
  };

  const getStudentCourses = (studentId: string) => {
    return courses.filter((c) => c.studentId === studentId);
  };

  const getStudentMonthCourses = (studentId: string, month: Date) => {
    const range = getMonthRange(month);
    const start = toDateStr(range.start);
    const end = toDateStr(range.end);
    return courses.filter(
      (c) => c.studentId === studentId && c.date >= start && c.date <= end
    );
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleSelectAllCourses = (monthCourses: Course[]) => {
    if (selectedCourses.length === monthCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(monthCourses.map((c) => c.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedCourses.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedCourses.length} 节课吗？`)) {
      deleteBatchCourses(selectedCourses);
      setSelectedCourses([]);
    }
  };

  const handleOpenBatchScheduleModal = () => {
    if (!selectedStudent) return;
    setBatchScheduleForm({
      startTime: '09:00',
      endTime: '10:00',
      selectedDates: [],
      calendarDate: new Date(),
    });
    setShowBatchScheduleModal(true);
  };

  const getBatchScheduleDaysInMonth = (date: Date) => {
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
        isSelected: batchScheduleForm.selectedDates.includes(dateStr),
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

  const handleBatchScheduleSelectDate = (date: string) => {
    setBatchScheduleForm((prev) => ({
      ...prev,
      selectedDates: prev.selectedDates.includes(date)
        ? prev.selectedDates.filter((d) => d !== date)
        : [...prev.selectedDates, date],
    }));
  };

  const handleBatchScheduleSubmit = () => {
    if (!selectedStudent || batchScheduleForm.selectedDates.length === 0) return;

    if (
      selectedStudent.type === 'prepaid' &&
      selectedStudent.remainingHours < batchScheduleForm.selectedDates.length
    ) {
      alert(
        `${selectedStudent.name}剩余${selectedStudent.remainingHours}课时，无法安排${batchScheduleForm.selectedDates.length}节课`
      );
      return;
    }

    const newCourses = batchScheduleForm.selectedDates.map((date) => ({
      studentId: selectedStudent.id,
      date,
      startTime: batchScheduleForm.startTime,
      endTime: batchScheduleForm.endTime,
      rate: selectedStudent.hourlyRate,
    }));

    addBatchCourses(newCourses);
    setShowBatchScheduleModal(false);
    alert(`成功为${selectedStudent.name}安排${newCourses.length}节课`);
  };

  const prepaidStudents = students.filter((s) => s.type === 'prepaid');
  const postpaidStudents = students.filter((s) => s.type === 'postpaid');

  return (
    <Layout title="学生管理">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            共 {students.length} 位学生
            <span className="mx-2">|</span>
            预付费 {prepaidStudents.length} 人
            <span className="mx-2">|</span>
            后付费 {postpaidStudents.length} 人
          </span>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加学生
        </button>
      </div>

      {prepaidStudents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-800">预付费学生</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prepaidStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleOpenDetailModal(student)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        预付费
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(student);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(student.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>剩余课时</span>
                    </div>
                    <span className={`font-semibold ${student.remainingHours <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                      {student.remainingHours} 节
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>课时费用</span>
                    </div>
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(student.hourlyRate)}/节
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {postpaidStudents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-800">后付费学生</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {postpaidStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleOpenDetailModal(student)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        后付费
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(student);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(student.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>课时费用</span>
                    </div>
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(student.hourlyRate)}/节
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>待结算</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(student.pendingAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无学生</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            添加学生
          </button>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="添加学生">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={studentForm.name}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="请输入学生姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="prepaid"
                  checked={studentForm.type === 'prepaid'}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, type: e.target.value as StudentType }))
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">预付费（提前购买课时）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="postpaid"
                  checked={studentForm.type === 'postpaid'}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, type: e.target.value as StudentType }))
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">后付费（上完结算）</span>
              </label>
            </div>
          </div>
          {studentForm.type === 'prepaid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">剩余课时</label>
              <input
                type="number"
                value={studentForm.remainingHours}
                onChange={(e) =>
                  setStudentForm((prev) => ({ ...prev, remainingHours: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入剩余课时"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每节课费用（元）</label>
            <input
              type="number"
              value={studentForm.hourlyRate}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="请输入每节课费用"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmitAdd}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="编辑学生">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={studentForm.name}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editType"
                  value="prepaid"
                  checked={studentForm.type === 'prepaid'}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, type: e.target.value as StudentType }))
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">预付费</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editType"
                  value="postpaid"
                  checked={studentForm.type === 'postpaid'}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, type: e.target.value as StudentType }))
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">后付费</span>
              </label>
            </div>
          </div>
          {studentForm.type === 'prepaid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">剩余课时</label>
              <input
                type="number"
                value={studentForm.remainingHours}
                onChange={(e) =>
                  setStudentForm((prev) => ({ ...prev, remainingHours: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每节课费用（元）</label>
            <input
              type="number"
              value={studentForm.hourlyRate}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmitEdit}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        {selectedStudent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                    selectedStudent.type === 'prepaid'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedStudent.name}</h3>
                  {selectedStudent.type === 'prepaid' && (
                    <p className="text-sm text-gray-500">
                      剩余 <span className={`font-semibold ${selectedStudent.remainingHours <= 5 ? 'text-red-500' : 'text-primary-600'}`}>{selectedStudent.remainingHours}</span> 课时
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleOpenBatchScheduleModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                排课
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setDetailMonth(new Date(detailMonth.getFullYear(), detailMonth.getMonth() - 1, 1))
                  }
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
                </button>
                <span className="font-semibold text-gray-800">
                  {detailMonth.getFullYear()}年{detailMonth.getMonth() + 1}月
                </span>
                <button
                  onClick={() =>
                    setDetailMonth(new Date(detailMonth.getFullYear(), detailMonth.getMonth() + 1, 1))
                  }
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {(() => {
                const year = detailMonth.getFullYear();
                const month = detailMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const monthCourses = getStudentMonthCourses(selectedStudent.id, detailMonth);
                const courseDates = new Set(monthCourses.map((c) => c.date));

                return (
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="pb-4" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = toDateStr(new Date(year, month, day));
                      const hasCourse = courseDates.has(dateStr);
                      const dayCourses = monthCourses
                        .filter((c) => c.date === dateStr)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
                      const isSelected = selectedCourses.some((id) =>
                        dayCourses.some((c) => c.id === id)
                      );

                      return (
                        <button
                          key={day}
                          onClick={() => {
                            const dayCourseIds = dayCourses.map((c) => c.id);
                            if (isSelected) {
                              setSelectedCourses((prev) =>
                                prev.filter((id) => !dayCourseIds.includes(id))
                              );
                            } else {
                              setSelectedCourses((prev) => [...new Set([...prev, ...dayCourseIds])]);
                            }
                          }}
                          className={`pb-4 rounded-lg flex flex-col items-center transition-all relative ${
                            hasCourse
                              ? isSelected
                                ? 'bg-primary-500 text-white'
                                : 'bg-primary-100 text-primary-700'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-sm font-medium pt-1">{day}</span>
                          {hasCourse && (
                            <div className="flex flex-col items-center gap-0.5 mt-1">
                              {dayCourses.slice(0, 3).map((course, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs truncate max-w-full ${isSelected ? 'text-white/90' : 'text-primary-600'}`}
                                >
                                  {course.startTime}
                                </span>
                              ))}
                              {dayCourses.length > 3 && (
                                <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-primary-500'}`}>
                                  +{dayCourses.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {selectedCourses.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <span className="text-sm text-red-600">已选 {selectedCourses.length} 节课</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCourses([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            )}

            {(() => {
              const monthCourses = getStudentMonthCourses(selectedStudent.id, detailMonth);
              if (monthCourses.length === 0) {
                return (
                  <div className="text-center py-6 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">本月暂无课程</p>
                  </div>
                );
              }

              const groupedByDate: { [date: string]: typeof monthCourses } = {};
              monthCourses.forEach((course) => {
                if (!groupedByDate[course.date]) {
                  groupedByDate[course.date] = [];
                }
                groupedByDate[course.date].push(course);
              });

              return (
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-xs text-gray-500 mb-2">课程时间</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.keys(groupedByDate)
                      .sort()
                      .map((date) => {
                        const dayCourses = groupedByDate[date];
                        const dayDate = new Date(date);
                        return (
                          <div key={date} className="flex items-center gap-2">
                            <div className="w-7 text-xs text-gray-500 font-medium">
                              {dayDate.getDate()}日
                            </div>
                            <div className="flex-1 flex flex-wrap gap-1">
                              {dayCourses
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((course) => (
                                  <span
                                    key={course.id}
                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                      selectedCourses.includes(course.id)
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {course.startTime}
                                  </span>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      <Modal isOpen={showBatchScheduleModal} onClose={() => setShowBatchScheduleModal(false)} title="批量排课" size="lg">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold ${
                  selectedStudent.type === 'prepaid'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-800">{selectedStudent.name}</div>
                <div className="text-sm text-gray-500">
                  {selectedStudent.type === 'prepaid'
                    ? `剩余${selectedStudent.remainingHours}课时`
                    : '后付费'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">选择日期</h4>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() =>
                    setBatchScheduleForm((prev) => ({
                      ...prev,
                      calendarDate: new Date(prev.calendarDate.getFullYear(), prev.calendarDate.getMonth() - 1, 1),
                    }))
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
                </button>
                <span className="font-medium text-gray-800">
                  {batchScheduleForm.calendarDate.getFullYear()}年{batchScheduleForm.calendarDate.getMonth() + 1}月
                </span>
                <button
                  onClick={() =>
                    setBatchScheduleForm((prev) => ({
                      ...prev,
                      calendarDate: new Date(prev.calendarDate.getFullYear(), prev.calendarDate.getMonth() + 1, 1),
                    }))
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getBatchScheduleDaysInMonth(batchScheduleForm.calendarDate).map(({ date, day, isCurrentMonth, isSelected }) => (
                  <button
                    key={date}
                    onClick={() => isCurrentMonth && handleBatchScheduleSelectDate(date)}
                    disabled={!isCurrentMonth}
                    className={`aspect-square flex items-center justify-center rounded text-xs font-medium transition-all ${
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="time"
                  value={batchScheduleForm.startTime}
                  onChange={(e) =>
                    setBatchScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="time"
                  value={batchScheduleForm.endTime}
                  onChange={(e) =>
                    setBatchScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {batchScheduleForm.selectedDates.length > 0 && (
              <div className="p-3 bg-primary-50 rounded-lg">
                <div className="text-sm text-primary-700 mb-2">预估课时：{batchScheduleForm.selectedDates.length}节</div>
                <div className="text-xl font-bold text-primary-600">
                  {formatCurrency(selectedStudent.hourlyRate * batchScheduleForm.selectedDates.length)}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchScheduleSubmit}
                disabled={batchScheduleForm.selectedDates.length === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认排课 ({batchScheduleForm.selectedDates.length}节)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

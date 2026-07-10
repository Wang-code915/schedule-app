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
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-semibold ${
                  selectedStudent.type === 'prepaid'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
                <span
                  className={`inline-block mt-1 text-sm px-2 py-0.5 rounded-full ${
                    selectedStudent.type === 'prepaid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {selectedStudent.type === 'prepaid' ? '预付费学生' : '后付费学生'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedStudent.type === 'prepaid' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">剩余课时</div>
                  <div
                    className={`text-2xl font-bold ${
                      selectedStudent.remainingHours <= 5 ? 'text-red-500' : 'text-gray-800'
                    }`}
                  >
                    {selectedStudent.remainingHours} 节
                  </div>
                </div>
              )}
              {selectedStudent.type === 'postpaid' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">待结算金额</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedStudent.pendingAmount)}
                  </div>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">课时费用</div>
                <div className="text-2xl font-bold text-primary-600">
                  {formatCurrency(selectedStudent.hourlyRate)}/节
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {detailMonth.getFullYear()}年{detailMonth.getMonth() + 1}月课程
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setDetailMonth(new Date(detailMonth.getFullYear(), detailMonth.getMonth() - 1, 1))
                    }
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
                  </button>
                  <button
                    onClick={() =>
                      setDetailMonth(new Date(detailMonth.getFullYear(), detailMonth.getMonth() + 1, 1))
                    }
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
                  </button>
                </div>
              </div>

              {(() => {
                const monthCourses = getStudentMonthCourses(selectedStudent.id, detailMonth);
                const monthTotal = monthCourses.reduce((sum, c) => sum + c.rate, 0);
                return (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <div className="text-xs text-gray-500">本月课时</div>
                      <div className="text-xl font-bold text-primary-600">{monthCourses.length} 节</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs text-gray-500">本月收入</div>
                      <div className="text-xl font-bold text-orange-600">{formatCurrency(monthTotal)}</div>
                    </div>
                  </div>
                );
              })()}

              {selectedCourses.length > 0 && (
                <div className="flex items-center justify-between mb-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-600">已选择 {selectedCourses.length} 节课</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCourses([])}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const monthCourses = getStudentMonthCourses(selectedStudent.id, detailMonth);
                if (monthCourses.length === 0) {
                  return <p className="text-gray-400 text-center py-4">本月暂无课程记录</p>;
                }

                const sortedCourses = [...monthCourses].sort(
                  (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
                );

                const groupedByDate: { [date: string]: typeof sortedCourses } = {};
                sortedCourses.forEach((course) => {
                  if (!groupedByDate[course.date]) {
                    groupedByDate[course.date] = [];
                  }
                  groupedByDate[course.date].push(course);
                });

                const dates = Object.keys(groupedByDate).sort();
                const allSelected =
                  selectedCourses.length > 0 &&
                  selectedCourses.length === monthCourses.length;

                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">共 {dates.length} 天有课</span>
                      <button
                        onClick={() => toggleSelectAllCourses(monthCourses)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {allSelected ? '取消全选' : '全选'}
                      </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {dates.map((date) => {
                        const dayCourses = groupedByDate[date];
                        const dayDate = new Date(date);
                        const dayTotal = dayCourses.reduce((sum, c) => sum + c.rate, 0);
                        const dayAllSelected = dayCourses.every((c) =>
                          selectedCourses.includes(c.id)
                        );
                        const someSelected = dayCourses.some((c) =>
                          selectedCourses.includes(c.id)
                        );

                        return (
                          <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div
                              className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (dayAllSelected) {
                                  setSelectedCourses((prev) =>
                                    prev.filter((id) => !dayCourses.some((c) => c.id === id))
                                  );
                                } else {
                                  setSelectedCourses((prev) => {
                                    const newIds = dayCourses
                                      .filter((c) => !prev.includes(c.id))
                                      .map((c) => c.id);
                                    return [...prev, ...newIds];
                                  });
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    dayAllSelected
                                      ? 'bg-primary-500 border-primary-500'
                                      : someSelected
                                      ? 'bg-primary-200 border-primary-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {dayAllSelected && <Check className="w-3 h-3 text-white" />}
                                  {!dayAllSelected && someSelected && (
                                    <div className="w-2 h-0.5 bg-primary-500 rounded" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center ${
                                      dayAllSelected
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-primary-100 text-primary-700'
                                    }`}
                                  >
                                    <span className="text-xs leading-none">
                                      {dayDate.getMonth() + 1}月
                                    </span>
                                    <span className="text-sm font-bold leading-none">
                                      {dayDate.getDate()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayDate.getDay()]}
                                    </div>
                                    <div className="text-xs text-gray-700 font-medium">
                                      {dayCourses.length}节课 · {formatCurrency(dayTotal)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                              {dayCourses.map((course) => {
                                const isSelected = selectedCourses.includes(course.id);
                                return (
                                  <div
                                    key={course.id}
                                    className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-primary-50'
                                        : 'bg-white hover:bg-gray-50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCourseSelection(course.id);
                                    }}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected
                                          ? 'bg-primary-500 border-primary-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 flex-1">
                                      {course.startTime} - {course.endTime}
                                    </span>
                                    <span className="text-sm font-semibold text-primary-600">
                                      {formatCurrency(course.rate)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedStudent);
                  setShowDetailModal(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                编辑信息
              </button>
              <button
                onClick={handleOpenBatchScheduleModal}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                批量排课
              </button>
            </div>
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

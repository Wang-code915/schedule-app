import { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign, User } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Modal } from '@/components/Modal';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/format';
import { StudentType } from '@/types';

export const StudentsPage = () => {
  const { state, addStudent, updateStudent, deleteStudent } = useApp();
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">近期课程</h4>
              {getStudentCourses(selectedStudent.id).length === 0 ? (
                <p className="text-gray-400 text-center py-4">暂无课程记录</p>
              ) : (
                <div className="space-y-2">
                  {getStudentCourses(selectedStudent.id)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 5)
                    .map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <span className="text-gray-800">{course.date}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-600">
                            {course.startTime} - {course.endTime}
                          </span>
                        </div>
                        <span className="text-primary-600 font-medium">
                          {formatCurrency(course.rate)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedStudent);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                编辑信息
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

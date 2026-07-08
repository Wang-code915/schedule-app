import { Student, Course, Log } from '@/types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockStudents: Student[] = [
  {
    id: '1',
    name: '张三',
    type: 'prepaid',
    remainingHours: 15,
    hourlyRate: 100,
    pendingAmount: 0,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: '李四',
    type: 'prepaid',
    remainingHours: 8,
    hourlyRate: 120,
    pendingAmount: 0,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: '王五',
    type: 'postpaid',
    remainingHours: 0,
    hourlyRate: 150,
    pendingAmount: 300,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: '赵六',
    type: 'prepaid',
    remainingHours: 20,
    hourlyRate: 100,
    pendingAmount: 0,
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: '孙七',
    type: 'postpaid',
    remainingHours: 0,
    hourlyRate: 130,
    pendingAmount: 130,
    createdAt: '2024-02-10',
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    studentId: '1',
    date: formatDate(today),
    startTime: '09:00',
    endTime: '10:00',
    rate: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    studentId: '2',
    date: formatDate(today),
    startTime: '10:30',
    endTime: '11:30',
    rate: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    studentId: '3',
    date: formatDate(today),
    startTime: '14:00',
    endTime: '15:00',
    rate: 150,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    studentId: '1',
    date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
    startTime: '09:00',
    endTime: '10:00',
    rate: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    studentId: '4',
    date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
    startTime: '14:00',
    endTime: '15:00',
    rate: 100,
    createdAt: new Date().toISOString(),
  },
];

export const mockLogs: Log[] = [
  {
    id: '1',
    type: 'schedule',
    content: '为张三安排了今日09:00-10:00的课程',
    relatedId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'hour_deduct',
    content: '张三剩余课时减少1节，当前剩余15节',
    relatedId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'schedule',
    content: '为王五安排了今日14:00-15:00的课程（后付费）',
    relatedId: '3',
    createdAt: new Date().toISOString(),
  },
];

export type StudentType = 'prepaid' | 'postpaid';

export interface Student {
  id: string;
  name: string;
  type: StudentType;
  remainingHours: number;
  hourlyRate: number;
  pendingAmount: number;
  createdAt: string;
}

export interface Course {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  rate: number;
  createdAt: string;
}

export type LogType = 'schedule' | 'hour_deduct' | 'hour_refund' | 'student_add' | 'student_edit';

export interface Log {
  id: string;
  type: LogType;
  content: string;
  relatedId: string;
  createdAt: string;
}

export interface AppState {
  students: Student[];
  courses: Course[];
  logs: Log[];
  selectedDate: string;
}

export type Action =
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'DELETE_BATCH_COURSES'; payload: string[] }
  | { type: 'ADD_BATCH_COURSES'; payload: Course[] }
  | { type: 'ADD_LOG'; payload: Log }
  | { type: 'SET_SELECTED_DATE'; payload: string };

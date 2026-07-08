import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Action, Student, Course, Log } from '@/types';
import { mockStudents, mockCourses, mockLogs } from '@/data/mockData';
import { loadState, saveState, generateId } from '@/utils/storage';

const today = new Date().toISOString().split('T')[0];

const initialState: AppState = {
  students: mockStudents,
  courses: mockCourses,
  logs: mockLogs,
  selectedDate: today,
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_STUDENT': {
      const newLog: Log = {
        id: generateId(),
        type: 'student_add',
        content: `添加学生：${action.payload.name}`,
        relatedId: action.payload.id,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        students: [...state.students, action.payload],
        logs: [newLog, ...state.logs],
      };
    }
    case 'UPDATE_STUDENT': {
      const newLog: Log = {
        id: generateId(),
        type: 'student_edit',
        content: `编辑学生信息：${action.payload.name}`,
        relatedId: action.payload.id,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
        logs: [newLog, ...state.logs],
      };
    }
    case 'DELETE_STUDENT': {
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.payload),
        courses: state.courses.filter((c) => c.studentId !== action.payload),
      };
    }
    case 'ADD_COURSE': {
      const { payload } = action;
      const student = state.students.find((s) => s.id === payload.studentId);
      let newStudents = state.students;
      let newLogs = state.logs;

      if (student) {
        const scheduleLog: Log = {
          id: generateId(),
          type: 'schedule',
          content: `为${student.name}安排了${payload.date} ${payload.startTime}-${payload.endTime}的课程${student.type === 'postpaid' ? '（后付费）' : ''}`,
          relatedId: payload.id,
          createdAt: new Date().toISOString(),
        };
        newLogs = [scheduleLog, ...newLogs];

        if (student.type === 'prepaid') {
          const newStudent: Student = {
            ...student,
            remainingHours: student.remainingHours - 1,
          };
          newStudents = state.students.map((s) =>
            s.id === student.id ? newStudent : s
          );
          const deductLog: Log = {
            id: generateId(),
            type: 'hour_deduct',
            content: `${student.name}剩余课时减少1节，当前剩余${newStudent.remainingHours}节`,
            relatedId: student.id,
            createdAt: new Date().toISOString(),
          };
          newLogs = [deductLog, ...newLogs];
        } else {
          const newStudent: Student = {
            ...student,
            pendingAmount: student.pendingAmount + payload.rate,
          };
          newStudents = state.students.map((s) =>
            s.id === student.id ? newStudent : s
          );
        }
      }

      return {
        ...state,
        students: newStudents,
        courses: [...state.courses, payload],
        logs: newLogs,
      };
    }
    case 'DELETE_COURSE': {
      const course = state.courses.find((c) => c.id === action.payload);
      if (!course) return state;

      const student = state.students.find((s) => s.id === course.studentId);
      let newStudents = state.students;
      let newLogs = state.logs;

      if (student) {
        if (student.type === 'prepaid') {
          const newStudent: Student = {
            ...student,
            remainingHours: student.remainingHours + 1,
          };
          newStudents = state.students.map((s) =>
            s.id === student.id ? newStudent : s
          );
          const refundLog: Log = {
            id: generateId(),
            type: 'hour_refund',
            content: `${student.name}剩余课时增加1节，当前剩余${newStudent.remainingHours}节`,
            relatedId: student.id,
            createdAt: new Date().toISOString(),
          };
          newLogs = [refundLog, ...newLogs];
        } else {
          const newStudent: Student = {
            ...student,
            pendingAmount: Math.max(0, student.pendingAmount - course.rate),
          };
          newStudents = state.students.map((s) =>
            s.id === student.id ? newStudent : s
          );
        }
      }

      return {
        ...state,
        students: newStudents,
        courses: state.courses.filter((c) => c.id !== action.payload),
        logs: newLogs,
      };
    }
    case 'ADD_BATCH_COURSES': {
      let newStudents = state.students;
      let newLogs = state.logs;
      const newCourses: Course[] = [];

      action.payload.forEach((course) => {
        newCourses.push(course);
        const student = newStudents.find((s) => s.id === course.studentId);
        if (student) {
          const scheduleLog: Log = {
            id: generateId(),
            type: 'schedule',
            content: `批量排课：为${student.name}安排了${course.date} ${course.startTime}-${course.endTime}的课程${student.type === 'postpaid' ? '（后付费）' : ''}`,
            relatedId: course.id,
            createdAt: new Date().toISOString(),
          };
          newLogs = [scheduleLog, ...newLogs];

          if (student.type === 'prepaid') {
            const newStudent: Student = {
              ...student,
              remainingHours: student.remainingHours - 1,
            };
            newStudents = newStudents.map((s) =>
              s.id === student.id ? newStudent : s
            );
            const deductLog: Log = {
              id: generateId(),
              type: 'hour_deduct',
              content: `${student.name}剩余课时减少1节，当前剩余${newStudent.remainingHours}节`,
              relatedId: student.id,
              createdAt: new Date().toISOString(),
            };
            newLogs = [deductLog, ...newLogs];
          } else {
            const newStudent: Student = {
              ...student,
              pendingAmount: student.pendingAmount + course.rate,
            };
            newStudents = newStudents.map((s) =>
              s.id === student.id ? newStudent : s
            );
          }
        }
      });

      return {
        ...state,
        students: newStudents,
        courses: [...state.courses, ...newCourses],
        logs: newLogs,
      };
    }
    case 'ADD_LOG': {
      return {
        ...state,
        logs: [action.payload, ...state.logs],
      };
    }
    case 'SET_SELECTED_DATE': {
      return {
        ...state,
        selectedDate: action.payload,
      };
    }
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'pendingAmount'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  deleteCourse: (id: string) => void;
  addBatchCourses: (courses: Omit<Course, 'id' | 'createdAt'>[]) => void;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const saved = loadState();
    return saved || initialState;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addStudent = (student: Omit<Student, 'id' | 'createdAt' | 'pendingAmount'>) => {
    dispatch({
      type: 'ADD_STUDENT',
      payload: {
        ...student,
        id: generateId(),
        createdAt: new Date().toISOString(),
        pendingAmount: 0,
      },
    });
  };

  const updateStudent = (student: Student) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: student });
  };

  const deleteStudent = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: id });
  };

  const addCourse = (course: Omit<Course, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD_COURSE',
      payload: {
        ...course,
        id: generateId(),
        createdAt: new Date().toISOString(),
      },
    });
  };

  const deleteCourse = (id: string) => {
    dispatch({ type: 'DELETE_COURSE', payload: id });
  };

  const addBatchCourses = (courses: Omit<Course, 'id' | 'createdAt'>[]) => {
    const fullCourses = courses.map((c) => ({
      ...c,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    dispatch({ type: 'ADD_BATCH_COURSES', payload: fullCourses });
  };

  const setSelectedDate = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addStudent,
        updateStudent,
        deleteStudent,
        addCourse,
        deleteCourse,
        addBatchCourses,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

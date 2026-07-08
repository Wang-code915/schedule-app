import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { CalendarPage } from '@/pages/Calendar';
import { StudentsPage } from '@/pages/Students';
import { BatchSchedulePage } from '@/pages/BatchSchedule';
import { SalaryPage } from '@/pages/Salary';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/batch-schedule" element={<BatchSchedulePage />} />
          <Route path="/salary" element={<SalaryPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

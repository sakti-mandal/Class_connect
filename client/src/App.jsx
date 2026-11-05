import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LiveBackground } from './components/LiveBackground';

import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Community } from './pages/Community';
import { Assignments } from './pages/Assignments';
import { ResourceHub } from './pages/ResourceHub';
import { AIAssistant } from './pages/AIAssistant';
import { SmartTeamFinder } from './pages/SmartTeamFinder';
import { CalendarPage } from './pages/CalendarPage';
import { AttendancePage } from './pages/AttendancePage';
import { SyllabusTrackerPage } from './pages/SyllabusTrackerPage';
import { ProfilePage } from './pages/ProfilePage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Role-based home director
function HomeRouter() {
  const { role } = useAuth();
  if (role === 'faculty') return <FacultyDashboard />;
  if (role === 'admin') return <AdminDashboard />;
  return <StudentDashboard />;
}

// Protected layout wrapper
function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // If on login/register/forgot-password, show standalone page
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password';

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50/75 dark:bg-slate-950/75 text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white transition-colors duration-300">
      {/* 🌌 GLOBAL FLOWING LEARNING WALLPAPER (Active on ALL Pages) */}
      <LiveBackground isAuthPage={isAuthPage} />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {isAuthPage ? (
          <main className="flex-1 flex items-center justify-center">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </main>
        ) : (
          <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <main className="flex-1 min-w-0 py-6 md:pl-8">
              <Routes>
                <Route path="/" element={<HomeRouter />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/community" element={<Community />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/resources" element={<ResourceHub />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/team-finder" element={<SmartTeamFinder />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/syllabus" element={<SyllabusTrackerPage />} />
                <Route path="/attendance" element={<SyllabusTrackerPage />} />
                <Route path="/faculty" element={<FacultyDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  FolderOpen,
  Bot,
  Users,
  Calendar,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();
  const { assignments, discussions } = useData();

  const pendingAssignmentsCount = assignments.filter(a => a.status === 'pending').length;

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['student', 'faculty', 'admin'],
    },
    {
      to: '/community',
      label: 'Class Community',
      icon: MessageSquare,
      roles: ['student', 'faculty', 'admin'],
      badge: discussions.length,
    },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: FileText,
      roles: ['student', 'faculty', 'admin'],
      badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : null,
    },
    {
      to: '/resources',
      label: 'Resource Hub',
      icon: FolderOpen,
      roles: ['student', 'faculty', 'admin'],
    },
    {
      to: '/ai-assistant',
      label: 'AI Study Assistant',
      icon: Bot,
      roles: ['student', 'faculty', 'admin'],
      highlight: true,
    },
    {
      to: '/team-finder',
      label: 'Team Finder',
      icon: Users,
      roles: ['student', 'faculty', 'admin'],
    },
    {
      to: '/calendar',
      label: 'Academic Calendar',
      icon: Calendar,
      roles: ['student', 'faculty', 'admin'],
    },
    {
      to: '/syllabus',
      label: 'Syllabus Tracker',
      icon: BookOpen,
      roles: ['student', 'faculty', 'admin'],
    },
    // Faculty desk
    {
      to: '/faculty',
      label: 'Faculty Portal',
      icon: GraduationCap,
      roles: ['faculty', 'admin'],
      section: 'Faculty Control',
    },
    // Admin desk
    {
      to: '/admin',
      label: 'Admin Console',
      icon: ShieldAlert,
      roles: ['admin'],
      section: 'Administration',
    },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-40 h-full md:h-[calc(100vh-4rem)] w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Menu</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredLinks.map((link, idx) => {
            const Icon = link.icon;

            return (
              <React.Fragment key={link.to}>
                {link.section && idx > 0 && (
                  <div className="pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3">
                    {link.section}
                  </div>
                )}

                <NavLink
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom AI Assistant link */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/ai-assistant"
            onClick={() => onClose && onClose()}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900 transition"
          >
            <Bot className="w-4 h-4" />
            <span>AI Study Copilot</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Check,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function StudentDashboard() {
  const { currentUser } = useAuth();
  const {
    timetable,
    assignments,
    announcements,
    resources,
    discussions,
    attendance,
    syllabus = [],
    courses,
  } = useData();
  const navigate = useNavigate();

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const totalPlannedLectures = syllabus.reduce((acc, c) => acc + (c.totalLectures || 0), 0);
  const totalDoneLectures = syllabus.reduce((acc, c) => acc + (c.completedLectures || 0), 0);
  const avgSyllabusProgress =
    totalPlannedLectures > 0
      ? ((totalDoneLectures / totalPlannedLectures) * 100).toFixed(0)
      : '76';

  const [quickAiPrompt, setQuickAiPrompt] = useState('');

  const handleQuickAiSubmit = e => {
    e.preventDefault();
    if (!quickAiPrompt.trim()) return;
    navigate(`/ai-assistant?prompt=${encodeURIComponent(quickAiPrompt)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Welcome Header - Clean & Simple */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {currentUser?.department || 'Computer Science'} • {currentUser?.semester || 'Year 3'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Alex'} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You have {pendingAssignments.length} assignments due this week and overall course syllabus coverage is {avgSyllabusProgress}%.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/ai-assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </Link>
          <Link
            to="/syllabus"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Syllabus Tracker</span>
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/syllabus"
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/60 transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Syllabus Coverage</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {avgSyllabusProgress}%
            </span>
            <span className="text-[11px] font-medium text-emerald-600">On Track</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{syllabus.length} Active Courses</span>
            <span className="text-brand-600 group-hover:underline font-medium">View Tracker →</span>
          </p>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {pendingAssignments.length}
            </span>
            <span className="text-[11px] font-medium text-amber-600">Action needed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Courses</span>
            <BookOpen className="w-4 h-4 text-brand-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {courses.length}
            </span>
            <span className="text-[11px] font-medium text-brand-600">18 Credits</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative GPA</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.gpa || '3.88'}
            </span>
            <span className="text-[11px] font-medium text-purple-600">Honor List</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Schedule & Assignments) + Right 1 Col (AI & Announcements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Today's Schedule
                </h3>
                <p className="text-xs text-slate-400">Class timetable & room allocations</p>
              </div>
              <Link
                to="/calendar"
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {timetable.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {slot.completed ? (
                        <Check className="w-4 h-4 text-slate-400" />
                      ) : slot.active ? (
                        <span className="w-2 h-2 rounded-full bg-brand-600 block mt-1.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 block mt-1.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {slot.subject}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {slot.code}
                        </span>
                        {slot.active && (
                          <span className="text-[10px] font-semibold text-brand-600">In Session</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {slot.time} • Room {slot.room} • {slot.faculty}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 self-end sm:self-center">
                    {slot.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Upcoming Assignments
                </h3>
                <p className="text-xs text-slate-400">Deadlines and pending tasks</p>
              </div>
              <Link
                to="/assignments"
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.slice(0, 3).map(asg => (
                <div
                  key={asg.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-brand-600">{asg.code}</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {asg.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Due: {asg.deadlineHuman}</span>
                    </p>
                  </div>

                  <div>
                    {asg.status === 'graded' ? (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                        Graded: {asg.grade}/{asg.points}
                      </span>
                    ) : asg.status === 'submitted' ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Submitted ✓
                      </span>
                    ) : (
                      <Link
                        to="/assignments"
                        className="px-3 py-1 rounded-md text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 transition"
                      >
                        Submit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Discussions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Recent Class Discussions
              </h3>
              <Link
                to="/community"
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                Open Forum
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {discussions.slice(0, 2).map(disc => (
                <Link
                  key={disc.id}
                  to="/community"
                  className="block py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-brand-600 font-medium">{disc.subject}</span>
                    <span>{disc.timestamp}</span>
                  </div>
                  <h4 className="font-medium text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                    {disc.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>{disc.replies.length} answers</span>
                    <span>•</span>
                    <span>{disc.upvotes} upvotes</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Study Assistant Box & Announcements */}
        <div className="space-y-6">
          {/* Simple AI Study Assistant Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                AI Study Assistant
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ask how to use ClassConnect (e.g. submit assignments) or get direct homework problem solving!
            </p>

            <form onSubmit={handleQuickAiSubmit} className="space-y-2">
              <input
                type="text"
                value={quickAiPrompt}
                onChange={e => setQuickAiPrompt(e.target.value)}
                placeholder="e.g. How to gave assignment?..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Ask Dual-Assist AI (Mode 0)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
              {[
                'How to gave assignment?',
                'Help solve Assignment 4',
                'Find project teammates',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate(`/ai-assistant?prompt=${encodeURIComponent(suggestion)}`)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Announcements */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Announcements
              </h3>
              <span className="text-[10px] text-slate-400">Campus notices</span>
            </div>

            <div className="space-y-3">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-brand-600">{ann.tag}</span>
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

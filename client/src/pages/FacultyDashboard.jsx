import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  PlusCircle,
  Send,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function FacultyDashboard() {
  const { courses, assignments, announcements, addAnnouncement, gradeAssignment } = useData();
  const { currentUser } = useAuth();

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTag, setAnnTag] = useState('Course Update');

  const [activeGradingAsg, setActiveGradingAsg] = useState(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');

  const pendingSubmissions = assignments.filter(a => a.status === 'submitted');

  const handlePostAnnouncement = e => {
    e.preventDefault();
    if (!annTitle.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      tag: annTag,
      priority: 'normal',
    });

    setAnnTitle('');
    setAnnContent('');
  };

  const handleSaveGrade = e => {
    e.preventDefault();
    if (!activeGradingAsg) return;

    gradeAssignment(activeGradingAsg.id, gradeVal, feedbackVal);
    setActiveGradingAsg(null);
    setGradeVal('');
    setFeedbackVal('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Faculty Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Faculty Console
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Welcome, {currentUser?.name || 'Professor'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course sections, review student submissions, and broadcast announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assignments"
            className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition"
          >
            + Create Assignment
          </Link>
          <Link
            to="/resources"
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
          >
            Upload Notes
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">Active Courses</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {courses.length}
          </p>
          <span className="text-[11px] text-brand-600">CS & AI Departments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">To Grade</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {pendingSubmissions.length}
          </p>
          <span className="text-[11px] text-amber-600">Submissions awaiting review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">Enrolled Students</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">164</p>
          <span className="text-[11px] text-emerald-600">Across 4 sections</span>
        </div>

        <Link
          to="/syllabus"
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 transition group"
        >
          <span className="text-xs text-slate-500">Syllabus Delivery</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">78.4%</p>
          <span className="text-[11px] text-brand-600 group-hover:underline">Manage Syllabus Tracker →</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submissions to grade */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Submissions to Grade ({pendingSubmissions.length})
              </h3>
            </div>

            {pendingSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All submissions evaluated!
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingSubmissions.map(sub => (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-brand-600">{sub.code}</span>
                      <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100">
                        {sub.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">File: {sub.submittedFile}</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveGradingAsg(sub);
                        setGradeVal(sub.points);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition"
                    >
                      Grade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Courses */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Assigned Courses
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1"
                >
                  <div className="flex justify-between font-medium">
                    <span className="text-brand-600">{course.code}</span>
                    <span className="text-slate-400">{course.credits} Credits</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{course.name}</h4>
                  <p className="text-slate-400 text-[11px]">{course.schedule} • {course.room}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Broadcast Announcement */}
        <div>
          <form
            onSubmit={handlePostAnnouncement}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Post Announcement
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                placeholder="e.g. Office hours moved"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category Tag
              </label>
              <input
                type="text"
                value={annTag}
                onChange={e => setAnnTag(e.target.value)}
                placeholder="Exam, Notice, Lab"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Content *
              </label>
              <textarea
                required
                rows={3}
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                placeholder="Type notice message..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </form>
        </div>
      </div>

      {/* Grading Modal */}
      {activeGradingAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleSaveGrade}
            className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Grade: {activeGradingAsg.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveGradingAsg(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Score (out of {activeGradingAsg.points}) *
              </label>
              <input
                type="number"
                required
                value={gradeVal}
                onChange={e => setGradeVal(e.target.value)}
                placeholder="e.g. 95"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Feedback
              </label>
              <textarea
                rows={2}
                value={feedbackVal}
                onChange={e => setFeedbackVal(e.target.value)}
                placeholder="Remarks..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveGradingAsg(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

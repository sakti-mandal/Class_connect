import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  User,
  Shield,
  Download,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

export function SyllabusTrackerPage() {
  const { role: userRole } = useAuth();
  const {
    syllabus = [],
    updateModuleStatus,
    toggleTopicRevision,
    logCompletedLecture,
    addSyllabusCourse,
    addModuleToCourse,
  } = useData();
  const { addToast } = useNotification();

  // Section switcher: 'student' | 'faculty' | 'admin' (defaults to logged-in user role)
  const [activeSection, setActiveSection] = useState(userRole || 'student');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [expandedCourseId, setExpandedCourseId] = useState('AI405');

  // Modals state
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isLogLectureOpen, setIsLogLectureOpen] = useState(false);
  const [selectedCourseForLog, setSelectedCourseForLog] = useState(null);
  const [lectureTopicInput, setLectureTopicInput] = useState('');

  // New Course Form state (for Admin)
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Computer Science & Engineering');
  const [newCourseFaculty, setNewCourseFaculty] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('4');
  const [newCourseLectures, setNewCourseLectures] = useState('32');
  const [newCourseTarget, setNewCourseTarget] = useState('Dec 2026');

  // New Module Form state (for Faculty)
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleLectures, setNewModuleLectures] = useState('6');
  const [addingModuleToCourseId, setAddingModuleToCourseId] = useState(null);

  // Compute overall stats
  const totalCourses = syllabus.length;
  const totalLectures = syllabus.reduce((acc, c) => acc + (Number(c.totalLectures) || 0), 0);
  const completedLectures = syllabus.reduce((acc, c) => acc + (Number(c.completedLectures) || 0), 0);
  const overallCoveragePct = totalLectures > 0 ? ((completedLectures / totalLectures) * 100).toFixed(1) : 0;

  // Filtered courses
  const filteredCourses = syllabus.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.faculty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      departmentFilter === 'all' || course.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Unique departments for filter
  const departments = ['all', ...new Set(syllabus.map(c => c.department))];

  // Confetti on topic revision check
  const handleToggleTopic = (courseId, moduleId, topicName, currentlyRevised) => {
    toggleTopicRevision(courseId, moduleId, topicName);
    if (!currentlyRevised) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
      addToast(`Marked "${topicName}" as revised! 🎯`, 'success');
    }
  };

  // Submit Log Lecture
  const handleLogLectureSubmit = e => {
    e.preventDefault();
    if (!selectedCourseForLog) return;
    logCompletedLecture(selectedCourseForLog.id, lectureTopicInput);
    setIsLogLectureOpen(false);
    setLectureTopicInput('');
    setSelectedCourseForLog(null);
  };

  // Submit Add Course (Admin)
  const handleAddCourseSubmit = e => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) {
      addToast('Course code and course name are required', 'error');
      return;
    }
    addSyllabusCourse({
      code: newCourseCode,
      name: newCourseName,
      department: newCourseDept,
      faculty: newCourseFaculty || 'Staff Lecturer',
      credits: newCourseCredits,
      totalLectures: newCourseLectures,
      targetCompletion: newCourseTarget,
    });
    setIsAddCourseOpen(false);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseFaculty('');
  };

  // Submit Add Module (Faculty)
  const handleAddModuleSubmit = (e, courseId) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addModuleToCourse(courseId, newModuleTitle, newModuleLectures);
    setNewModuleTitle('');
    setAddingModuleToCourseId(null);
  };

  // Download syllabus outline
  const handleDownloadSyllabus = course => {
    const outline = `# ${course.code}: ${course.name}
Faculty: ${course.faculty}
Department: ${course.department}
Semester: ${course.semester} | Credits: ${course.credits}
Total Planned Lectures: ${course.totalLectures} | Completed: ${course.completedLectures}
Target Exam Date: ${course.targetCompletion}

==================================================
SYLLABUS MODULES & TOPICS BREAKDOWN
==================================================
${course.modules
  .map(
    m => `
Module ${m.number}: ${m.title} [Status: ${m.status} | ${m.lectures} Lectures]
${m.topics.map(t => `  - [${t.done ? 'x' : ' '}] ${t.name}`).join('\n')}
`
  )
  .join('\n')}
`;
    const blob = new Blob([outline], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.code}_Syllabus_Outline.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded syllabus outline for ${course.code}`, 'info');
  };

  return (
    <div className="space-y-6 pb-14 animate-fade-in max-w-6xl mx-auto">
      {/* ── TOP HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <BookOpen className="w-3.5 h-3.5" />
              Unified Academic Curriculum
            </span>
            <span className="text-xs text-slate-400">
              {totalCourses} Courses Tracked
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Syllabus Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One centralized system to monitor curriculum progress, course delivery, and exam readiness for Students, Faculty, and Admin.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs">
          {[
            { key: 'student', label: '🎓 Student Section', roleReq: 'student' },
            { key: 'faculty', label: '👨‍🏫 Faculty Section', roleReq: 'faculty' },
            { key: 'admin', label: '🛡️ Admin Section', roleReq: 'admin' },
          ].map(sec => (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSection === sec.key
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{sec.label}</span>
              {userRole === sec.roleReq && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Your Primary Role" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 SUMMARY METRIC CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Courses Tracked */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Courses Tracked</span>
            <Layers className="w-4 h-4 text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {totalCourses}
            </span>
            <span className="text-[11px] font-semibold text-brand-600">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all semesters</p>
        </div>

        {/* Overall Syllabus Coverage */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Syllabus Coverage</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {overallCoveragePct}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">On Track</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${overallCoveragePct}%` }}
            />
          </div>
        </div>

        {/* Completed Lectures */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Lectures Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {completedLectures}
            </span>
            <span className="text-xs text-slate-400 font-normal">/ {totalLectures} sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalLectures - completedLectures} lectures remaining
          </p>
        </div>

        {/* Target Exam Date */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Curriculum Deadline</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Nov 30, 2026
            </span>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            End-Term Exam Preparation
          </p>
        </div>
      </div>

      {/* ── SEARCH & FILTERS BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by course code, topic, or professor..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 capitalize"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          {/* Action Button based on Section */}
          {activeSection === 'admin' && (
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          )}

          {activeSection === 'faculty' && (
            <button
              onClick={() => {
                setSelectedCourseForLog(syllabus[0] || null);
                setIsLogLectureOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Log Delivered Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* ── ROLE-SPECIFIC BANNER HIGHLIGHT ──────────────────────────── */}
      {activeSection === 'student' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-brand-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-600 text-white font-bold">🎓</span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Student Self-Study & Revision Mode Active
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Click the checkboxes below each module to track topics you have revised. Download course outlines for exam study.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
            Interactive Checklists Enabled
          </span>
        </div>
      )}

      {activeSection === 'faculty' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600 text-white font-bold">👨‍🏫</span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Faculty Course Syllabus Manager Active
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Log completed lecture sessions, update module delivery status, and append new curriculum topics.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
            Instructor Controls Enabled
          </span>
        </div>
      )}

      {activeSection === 'admin' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-600 text-white font-bold">🛡️</span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                University Curriculum & Syllabus Audit Console
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Auditing {totalCourses} courses across {departments.length - 1} departments. Monitor instructional pacing and add newly accredited syllabi.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            System Admin Level
          </span>
        </div>
      )}

      {/* ── COURSE SYLLABUS LIST ────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No courses found matching your filter criteria.
          </div>
        ) : (
          filteredCourses.map(course => {
            const isExpanded = expandedCourseId === course.id;
            const progress = (
              (course.completedLectures / (course.totalLectures || 1)) *
              100
            ).toFixed(0);

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition"
              >
                {/* Course Header Banner */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-mono">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {course.department} • {course.semester} • {course.credits} Credits
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.status === 'On Track'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : course.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {course.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Instructor: <strong>{course.faculty}</strong>
                    </p>
                  </div>

                  {/* Progress & Quick Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="min-w-[160px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium text-[11px]">
                          {course.completedLectures} / {course.totalLectures} Lectures
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Target Exam: {course.targetCompletion}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Faculty Action: Log Lecture */}
                      {activeSection === 'faculty' && (
                        <button
                          onClick={() => {
                            setSelectedCourseForLog(course);
                            setIsLogLectureOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-1 transition"
                          title="Log Lecture Delivered"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1 Lecture</span>
                        </button>
                      )}

                      {/* Download syllabus */}
                      <button
                        onClick={() => handleDownloadSyllabus(course)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition"
                        title="Download Syllabus Outline"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Expand / Collapse Toggle */}
                      <button
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition"
                        title="Expand / Collapse Modules"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── EXPANDED MODULES & TOPICS ─────────────────────── */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/60 dark:bg-slate-950/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Course Modules & Detailed Topics ({course.modules.length} Modules)
                      </h4>

                      {/* Faculty / Admin: Add Module button */}
                      {(activeSection === 'faculty' || activeSection === 'admin') && (
                        <button
                          onClick={() => setAddingModuleToCourseId(course.id)}
                          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Module
                        </button>
                      )}
                    </div>

                    {/* Inline Form to add module */}
                    {addingModuleToCourseId === course.id && (
                      <form
                        onSubmit={e => handleAddModuleSubmit(e, course.id)}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-700 space-y-3"
                      >
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Add New Module to {course.code}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                            placeholder="Module Title (e.g. Distributed Caching & Redis)"
                            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                          <input
                            type="number"
                            min="1"
                            value={newModuleLectures}
                            onChange={e => setNewModuleLectures(e.target.value)}
                            placeholder="Lectures (e.g. 6)"
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAddingModuleToCourseId(null)}
                            className="px-3 py-1 rounded-lg text-slate-500 text-xs hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                          >
                            Save Module
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Modules grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {course.modules.map(module => (
                        <div
                          key={module.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Module {module.number} • {module.lectures} Planned Lectures
                              </span>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                                {module.title}
                              </h4>
                            </div>

                            {/* Module status badge / selector */}
                            {(activeSection === 'faculty' || activeSection === 'admin') ? (
                              <select
                                value={module.status}
                                onChange={e =>
                                  updateModuleStatus(course.id, module.id, e.target.value)
                                }
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 ${
                                  module.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : module.status === 'In Progress'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <option value="Upcoming">Upcoming</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                  module.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : module.status === 'In Progress'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {module.status}
                              </span>
                            )}
                          </div>

                          {/* Topics List with Student Self-Study Checkboxes */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {module.topics.map((topic, idx) => (
                              <div
                                key={idx}
                                className={`flex items-start gap-2.5 p-1.5 rounded-lg text-xs transition ${
                                  topic.selfRevised
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                {activeSection === 'student' ? (
                                  <input
                                    type="checkbox"
                                    checked={Boolean(topic.selfRevised)}
                                    onChange={() =>
                                      handleToggleTopic(
                                        course.id,
                                        module.id,
                                        topic.name,
                                        topic.selfRevised
                                      )
                                    }
                                    className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    title="Mark as Revised by Student"
                                  />
                                ) : (
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                      topic.done ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                  />
                                )}
                                <span
                                  className={`flex-1 text-[11px] ${
                                    topic.selfRevised ? 'line-through text-slate-400' : ''
                                  }`}
                                >
                                  {topic.name}
                                </span>
                                {topic.done && (
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    Taught ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: LOG COMPLETED LECTURE (FACULTY) ──────────────────── */}
      {isLogLectureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                Log Completed Lecture
              </h3>
              <button
                onClick={() => setIsLogLectureOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogLectureSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Select Course *
                </label>
                <select
                  value={selectedCourseForLog?.id || ''}
                  onChange={e => {
                    const found = syllabus.find(c => c.id === e.target.value);
                    setSelectedCourseForLog(found || null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {syllabus.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name} ({c.completedLectures}/{c.totalLectures} Done)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Today's Delivered Topic (Optional)
                </label>
                <input
                  type="text"
                  value={lectureTopicInput}
                  onChange={e => setLectureTopicInput(e.target.value)}
                  placeholder="e.g. Scaled Dot-Product Self-Attention Mechanics"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs">
                💡 Submitting will advance completed lecture count by <strong>+1</strong> and update overall course progress.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogLectureOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  Record Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD COURSE SYLLABUS (ADMIN) ──────────────────────── */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-600" />
                Add New Course to Syllabus
              </h3>
              <button
                onClick={() => setIsAddCourseOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    placeholder="e.g. CS450"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCourseCredits}
                    onChange={e => setNewCourseCredits(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  placeholder="e.g. Distributed Database Architecture"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newCourseDept}
                    onChange={e => setNewCourseDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Lead Faculty
                  </label>
                  <input
                    type="text"
                    value={newCourseFaculty}
                    onChange={e => setNewCourseFaculty(e.target.value)}
                    placeholder="e.g. Dr. Sarah Chen"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Total Planned Lectures
                  </label>
                  <input
                    type="number"
                    value={newCourseLectures}
                    onChange={e => setNewCourseLectures(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="text"
                    value={newCourseTarget}
                    onChange={e => setNewCourseTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition"
                >
                  Create Course Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SyllabusTrackerPage;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Server,
  PlusCircle,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

export function AdminDashboard() {
  const { adminStats, courses } = useData();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('users');
  const [searchUser, setSearchUser] = useState('');

  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newFaculty, setNewFaculty] = useState('Dr. Sarah Chen');
  const [newCredits, setNewCredits] = useState(4);

  const [userList, setUserList] = useState([
    { id: 'u-1', name: 'Alex Rivera', email: 'alex.rivera@university.edu', role: 'Student', dept: 'Computer Science', status: 'Active' },
    { id: 'u-2', name: 'Dr. Sarah Chen', email: 'sarah.chen@university.edu', role: 'Faculty', dept: 'Artificial Intelligence', status: 'Active' },
    { id: 'u-3', name: 'Prof. Robert Sterling', email: 'robert.sterling@university.edu', role: 'Admin', dept: 'Academic Affairs', status: 'Active' },
    { id: 'u-4', name: 'Maya Lin', email: 'maya.lin@university.edu', role: 'Student', dept: 'HCI & Design', status: 'Active' },
    { id: 'u-5', name: 'Devansh Patel', email: 'devansh.patel@university.edu', role: 'Student', dept: 'Autonomous Systems', status: 'Active' },
  ]);

  const filteredUsers = userList.filter(
    u =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleToggleStatus = id => {
    setUserList(prev =>
      prev.map(u => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
    );
    addToast('Status updated.', 'info');
  };

  const handleAddCourse = e => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    addToast(`Course ${newCode} created.`, 'success');
    setIsAddCourseOpen(false);
    setNewCode('');
    setNewName('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Admin Console
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage user accounts, curriculum courses, and monitor platform health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/syllabus"
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Syllabus Tracker</span>
          </Link>
          <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1.5 rounded-xl font-medium">
            ● Uptime: {adminStats.serverUptime}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">Students</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {adminStats.totalStudents}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">Faculty</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {adminStats.activeFaculty}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">Submissions (Week)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {adminStats.assignmentsTurnedInThisWeek}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">AI Queries</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {adminStats.aiQueriesAnswered}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: 'users', label: 'Users', icon: Users },
          { key: 'courses', label: 'Courses', icon: BookOpen },
          { key: 'system', label: 'Logs', icon: Server },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === tab.key
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Search user..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <span className="text-xs text-slate-400">{filteredUsers.length} accounts</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Department</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{u.name}</span>
                    <span className="text-slate-400 block text-[11px]">{u.email}</span>
                  </td>
                  <td className="px-4 py-2.5">{u.role}</td>
                  <td className="px-4 py-2.5 text-slate-500">{u.dept}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium ${u.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Curriculum Courses ({courses.length})
            </span>
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(course => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-brand-600">{course.code}</span>
                  <span className="text-slate-400">{course.credits} Credits</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{course.name}</h4>
                <p className="text-slate-500">{course.faculty}</p>
                <p className="text-slate-400 text-[11px]">{course.schedule} • {course.room}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOGS */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            Recent Activity Logs
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {[
              { time: '22:04:18', type: 'AUTH', desc: 'User Dr. Sarah Chen signed in.' },
              { time: '21:50:02', type: 'AI', desc: 'Gemini quiz generation completed.' },
              { time: '21:32:44', type: 'UPLOAD', desc: 'File transformer_specs.pdf stored.' },
            ].map((log, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between text-slate-700 dark:text-slate-300">
                <span>[{log.type}] {log.desc}</span>
                <span className="text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleAddCourse}
            className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                New Course
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCourseOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Code *
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. CS410"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCourseOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

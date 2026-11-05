import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  UploadCloud,
  PlusCircle,
  Calendar,
  Award,
  Paperclip,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { uploadFile } from '../services/aiService';

export function Assignments() {
  const { assignments, courses, submitAssignment, createAssignment, gradeAssignment } = useData();
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty creation modal
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(courses[0]?.name || 'Distributed Cloud Systems');
  const [newDeadline, setNewDeadline] = useState('2026-11-20T23:59');
  const [newPoints, setNewPoints] = useState(100);
  const [newInstructions, setNewInstructions] = useState('');

  // Faculty grading modal
  const [gradingAsg, setGradingAsg] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const isFaculty = role === 'faculty' || role === 'admin';

  const filteredAssignments = assignments.filter(asg => {
    if (filterStatus === 'pending') return asg.status === 'pending';
    if (filterStatus === 'submitted') return asg.status === 'submitted';
    if (filterStatus === 'graded') return asg.status === 'graded';
    return true;
  });

  const handleFinalSubmit = async e => {
    e.preventDefault();
    if (!selectedAsgForSubmit) return;

    setIsSubmitting(true);
    let uploadedMeta = { name: 'Assignment_Solution.pdf' };

    if (submissionFile) {
      const res = await uploadFile(submissionFile);
      if (res?.file) uploadedMeta = res.file;
    }

    submitAssignment(selectedAsgForSubmit.id, uploadedMeta, submissionComment);
    setIsSubmitting(false);
    setSelectedAsgForSubmit(null);
    setSubmissionFile(null);
    setSubmissionComment('');

    confetti({ particleCount: 70, spread: 60 });
  };

  const handleCreateAssignment = e => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const courseObj = courses.find(c => c.name === newSubject);
    const deadlineDate = new Date(newDeadline);
    const deadlineHuman = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    createAssignment({
      title: newTitle,
      subject: newSubject,
      code: courseObj?.code || 'CS301',
      deadline: newDeadline,
      deadlineHuman,
      points: Number(newPoints),
      instructions: newInstructions,
    });

    setIsCreating(false);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleGradeSubmit = e => {
    e.preventDefault();
    if (!gradingAsg) return;
    gradeAssignment(gradingAsg.id, gradeScore, gradeFeedback);
    setGradingAsg(null);
    setGradeScore('');
    setGradeFeedback('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Assignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View course tasks, submit deliverables, and check grading feedback.
          </p>
        </div>

        {isFaculty && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'graded', label: 'Graded' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              filterStatus === tab.key
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map(asg => {
          const isPending = asg.status === 'pending';
          const isSubmitted = asg.status === 'submitted';
          const isGraded = asg.status === 'graded';

          return (
            <div
              key={asg.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-brand-600">{asg.code}</span>

                  {isGraded ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {asg.grade}/{asg.points} pts
                    </span>
                  ) : isSubmitted ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Submitted
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Due Soon
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {asg.subject} • {asg.faculty}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                  {asg.instructions}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {asg.deadlineHuman}</span>
                  </span>
                  <span>{asg.points} pts</span>
                </div>

                {isGraded && asg.feedback && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Feedback:</strong> {asg.feedback}
                  </div>
                )}

                {isSubmitted && asg.submittedFile && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    File: {asg.submittedFile}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  {isPending && (
                    <button
                      onClick={() => setSelectedAsgForSubmit(asg)}
                      className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition"
                    >
                      Submit
                    </button>
                  )}

                  {isSubmitted && !isGraded && (
                    <button
                      onClick={() => setSelectedAsgForSubmit(asg)}
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Resubmit
                    </button>
                  )}

                  {isFaculty && isSubmitted && !isGraded && (
                    <button
                      onClick={() => {
                        setGradingAsg(asg);
                        setGradeScore(asg.points);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition"
                    >
                      Grade
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Submit Modal */}
      {selectedAsgForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleFinalSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Submit: {selectedAsgForSubmit.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAsgForSubmit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Upload File (PDF, Code, ZIP)
              </label>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-brand-500">
                <input
                  type="file"
                  id="submit-modal-file"
                  onChange={e => setSubmissionFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="submit-modal-file" className="cursor-pointer space-y-1 block">
                  <UploadCloud className="w-6 h-6 mx-auto text-brand-600" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {submissionFile ? submissionFile.name : 'Choose file or drag & drop'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Comments (optional)
              </label>
              <textarea
                rows={2}
                value={submissionComment}
                onChange={e => setSubmissionComment(e.target.value)}
                placeholder="Notes for professor..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAsgForSubmit(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty Create Assignment Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAssignment}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                New Assignment
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Lab 4: Memory Caching"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={newPoints}
                  onChange={e => setNewPoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Instructions
              </label>
              <textarea
                rows={3}
                value={newInstructions}
                onChange={e => setNewInstructions(e.target.value)}
                placeholder="Task details..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty Grading Modal */}
      {gradingAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleGradeSubmit}
            className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Grade: {gradingAsg.title}
              </h3>
              <button
                type="button"
                onClick={() => setGradingAsg(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Score (out of {gradingAsg.points}) *
              </label>
              <input
                type="number"
                required
                value={gradeScore}
                onChange={e => setGradeScore(e.target.value)}
                placeholder="e.g. 95"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Feedback
              </label>
              <textarea
                rows={2}
                value={gradeFeedback}
                onChange={e => setGradeFeedback(e.target.value)}
                placeholder="Feedback remarks..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGradingAsg(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium text-xs"
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

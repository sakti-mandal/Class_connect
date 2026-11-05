import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  PlusCircle,
  Search,
  Send,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function Community() {
  const { discussions, courses, addDiscussion, addReply, toggleUpvote, toggleAcceptedAnswer } =
    useData();
  const { role } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(courses[0]?.name || 'Deep Learning & Neural Networks');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const [activeReplyThreadId, setActiveReplyThreadId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredDiscussions = discussions.filter(item => {
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesSearch =
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handlePostQuestion = e => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addDiscussion(newTitle, newContent, newSubject, parsedTags);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAsking(false);
  };

  const handleSendReply = discussionId => {
    if (!replyText.trim()) return;
    addReply(discussionId, replyText);
    setReplyText('');
    setActiveReplyThreadId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Class Community
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask questions, collaborate with peers, and view faculty verified answers.
          </p>
        </div>

        <button
          onClick={() => setIsAsking(!isAsking)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAsking ? 'Cancel' : 'Ask Question'}</span>
        </button>
      </div>

      {/* Ask Question Box */}
      {isAsking && (
        <form
          onSubmit={handlePostQuestion}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Ask a Question
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Title / Question *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. How does backpropagation handle vanishing gradients in RNNs?"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Course
              </label>
              <select
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="PyTorch, Optimization, RNN"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Details *
            </label>
            <textarea
              required
              rows={3}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Provide background context or code snippet..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAsking(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
            >
              Post Question
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('All')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
              selectedSubject === 'All'
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Courses
          </button>
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedSubject(c.name)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedSubject === c.name
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter discussions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Discussions Feed */}
      <div className="space-y-3">
        {filteredDiscussions.map(disc => (
          <div
            key={disc.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={disc.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {disc.author}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {disc.subject} • {disc.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleUpvote(disc.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                  disc.hasUpvoted
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{disc.upvotes}</span>
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {disc.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {disc.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {disc.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Replies section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{disc.replies.length} Answers</span>
                <button
                  onClick={() =>
                    setActiveReplyThreadId(activeReplyThreadId === disc.id ? null : disc.id)
                  }
                  className="text-brand-600 hover:underline font-medium"
                >
                  {activeReplyThreadId === disc.id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {disc.replies.map(reply => (
                <div
                  key={reply.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    reply.isAccepted
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                      : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {reply.author}
                      </span>
                      <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                    </div>

                    {reply.isAccepted ? (
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                      </span>
                    ) : (
                      (role === 'faculty' || role === 'admin') && (
                        <button
                          onClick={() => toggleAcceptedAnswer(disc.id, reply.id)}
                          className="text-[10px] text-slate-400 hover:text-emerald-600"
                        >
                          Mark Accepted
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              ))}

              {activeReplyThreadId === disc.id && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply(disc.id)}
                    placeholder="Write an answer..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    onClick={() => handleSendReply(disc.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

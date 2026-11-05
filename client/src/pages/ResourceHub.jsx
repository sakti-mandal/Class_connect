import React, { useState } from 'react';
import {
  FolderOpen,
  Download,
  UploadCloud,
  Search,
  PlusCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { uploadFile } from '../services/aiService';

export function ResourceHub() {
  const { resources, courses, addResource, incrementDownload } = useData();
  const { addToast } = useNotification();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState(courses[0]?.name || 'Deep Learning & Neural Networks');
  const [uploadType, setUploadType] = useState('PDF Notes');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredResources = resources.filter(res => {
    const matchesSubject = selectedSubject === 'All' || res.subject === selectedSubject;
    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.uploader.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  const handleDownload = res => {
    incrementDownload(res.id);
    addToast(`Downloading ${res.title}...`, 'info');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent(
          `ClassConnect Academic Resource Document: ${res.title}\nSubject: ${res.subject}\nUploader: ${res.uploader}\n\n${res.description}`
        )
    );
    element.setAttribute('download', `${res.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUploadSubmit = async e => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    let fileSizeStr = '2.4 MB';

    if (selectedFile) {
      await uploadFile(selectedFile);
      fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const courseObj = courses.find(c => c.name === uploadSubject);

    addResource({
      title: uploadTitle,
      subject: uploadSubject,
      code: courseObj?.code || 'CS301',
      type: uploadType,
      size: fileSizeStr,
      description: uploadDescription,
    });

    setIsUploading(false);
    setIsUploadOpen(false);
    setUploadTitle('');
    setUploadDescription('');
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Resource Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Access lecture notes, lab guides, past exam question papers, and cheatsheets.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic or keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Category:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="All">All Formats</option>
              <option value="PDF Notes">PDF Notes</option>
              <option value="Cheatsheet">Cheatsheet</option>
              <option value="Past Paper">Past Paper</option>
              <option value="Lab Manual">Lab Manual</option>
            </select>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
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
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(res => (
          <div
            key={res.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-brand-600">{res.code}</span>
                <span className="text-[11px] text-slate-400">{res.type}</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {res.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {res.size} • {res.downloadCount} downloads
              </span>

              <button
                onClick={() => handleDownload(res)}
                className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleUploadSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Upload Resource
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus Notes"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={uploadSubject}
                  onChange={e => setUploadSubject(e.target.value)}
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
                  Type
                </label>
                <select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="PDF Notes">PDF Notes</option>
                  <option value="Cheatsheet">Cheatsheet</option>
                  <option value="Past Paper">Past Paper</option>
                  <option value="Lab Manual">Lab Manual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                File Attachment
              </label>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-brand-500">
                <input
                  type="file"
                  id="resource-simple-file"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="resource-simple-file" className="cursor-pointer space-y-1 block">
                  <UploadCloud className="w-5 h-5 mx-auto text-brand-600" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : 'Select PDF or document'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Brief Description
              </label>
              <textarea
                rows={2}
                value={uploadDescription}
                onChange={e => setUploadDescription(e.target.value)}
                placeholder="Key concepts covered..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                {isUploading ? 'Uploading...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

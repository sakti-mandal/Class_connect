import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  FileText,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Compass,
  Code2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { askGeminiChat, summarizeText, generateQuiz, explainConcept } from '../services/aiService';
import { useNotification } from '../context/NotificationContext';

export function AIAssistant() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPrompt = searchParams.get('prompt') || '';
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('chat');

  // ==================== 0 DEFAULT & 2 POSSIBILITIES ====================
  // 0 = Dual-Assist (Default: automatically provides BOTH Platform Guide & Assignment Solver)
  // 1 = Platform & Web Page Guide Only (How to submit assignments, view notes, attendance, timetable)
  // 2 = Assignment & Coursework Problem Solver Only (Code help, math derivations, step-by-step problem solver)
  const [chatMode, setChatMode] = useState(0);

  // ==================== 1. CHAT MODE ====================
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `### 🎯 Welcome to ClassConnect AI Study Copilot!
*(Smart Assistant — Mode 0 Default)*

I am your campus assistant ready to help you with anything:
1. 🏫 **Website Doubts**: Ask how to submit assignments, download lecture notes, check attendance, or find teammates on ClassConnect.
2. 💻 **Assignment Help**: Ask for code snippets, step-by-step problem solving, math derivations, or homework debugging.

Ask me whatever you need, and I will answer directly!
- *Website Doubt:* **"How to gave assignment on web page?"**
- *Assignment Help:* **"Help me with Assignment 4 (Transformer Attention)"**`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [selectedSubject, setSelectedSubject] = useState('Deep Learning');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      handleSendChatMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  const handleSendChatMessage = async customText => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const res = await askGeminiChat(textToSend, selectedSubject, chatMode);
      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: res.reply,
        source: res.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      addToast('Failed to get AI response.', 'error');
    } finally {
      setIsChatLoading(false);
    }
  };

  // ==================== 2. SUMMARIZER MODE ====================
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryFormat, setSummaryFormat] = useState('bullet-points');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!summaryInput.trim() || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await summarizeText(summaryInput, summaryFormat);
      setSummaryOutput(res.summary);
    } catch (e) {
      addToast('Summarization failed.', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  // ==================== 3. QUIZ GENERATOR ====================
  const [quizTopic, setQuizTopic] = useState('Data Structures & Algorithms');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setUserAnswers({});
    setShowResults(false);
    try {
      const res = await generateQuiz(quizTopic, quizDifficulty, 4);
      setQuizQuestions(res.quiz || []);
      addToast(`Generated ${res.quiz?.length || 4} questions!`, 'success');
    } catch (e) {
      addToast('Quiz generation error.', 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectQuizOption = (qId, optionIndex) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    const correctCount = quizQuestions.filter(
      q => userAnswers[q.id] === q.answerIndex
    ).length;

    if (correctCount >= quizQuestions.length / 2) {
      confetti({ particleCount: 70, spread: 60 });
      addToast(`You scored ${correctCount}/${quizQuestions.length}!`, 'success');
    } else {
      addToast(`Score: ${correctCount}/${quizQuestions.length}. Review explanations below.`, 'info');
    }
  };

  // ==================== 4. CONCEPT EXPLAINER ====================
  const [conceptInput, setConceptInput] = useState('');
  const [explainMode, setExplainMode] = useState('intuitive');
  const [explanationOutput, setExplanationOutput] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleExplain = async () => {
    if (!conceptInput.trim() || isExplaining) return;
    setIsExplaining(true);
    try {
      const res = await explainConcept(conceptInput, explainMode);
      setExplanationOutput(res.explanation);
    } catch (e) {
      addToast('Explanation failed.', 'error');
    } finally {
      setIsExplaining(false);
    }
  };

  const [copiedId, setCopiedId] = useState(null);
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copied to clipboard!', 'info', 2000);
  };

  function renderInlineFormatting(str) {
    if (!str) return '';
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((segment, sIdx) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return (
          <strong key={sIdx} className="font-semibold text-slate-900 dark:text-slate-100">
            {segment.slice(2, -2)}
          </strong>
        );
      }
      if (segment.startsWith('`') && segment.endsWith('`')) {
        return (
          <code
            key={sIdx}
            className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-mono text-[11px]"
          >
            {segment.slice(1, -1)}
          </code>
        );
      }
      return segment;
    });
  }

  function renderMarkdownBlocks(text) {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.slice(3, firstLineEnd).trim() || 'code';
        const code = part.slice(firstLineEnd + 1, -3);
        const codeId = `code-${pIdx}-${Date.now()}`;

        return (
          <div
            key={pIdx}
            className="my-2.5 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 font-mono text-[11px]"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="uppercase font-semibold tracking-wider text-brand-400">{lang}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(code, codeId)}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre font-mono leading-relaxed text-emerald-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={pIdx} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-0.5" />;

            if (trimmed.startsWith('#### ')) {
              return (
                <h5
                  key={lIdx}
                  className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-2 mb-1"
                >
                  {renderInlineFormatting(trimmed.replace(/^####\s*/, ''))}
                </h5>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h4
                  key={lIdx}
                  className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 mb-1"
                >
                  {renderInlineFormatting(trimmed.replace(/^###\s*/, ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('---')) {
              return <hr key={lIdx} className="my-2 border-slate-200 dark:border-slate-800" />;
            }

            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={lIdx}
                  className="pl-2.5 border-l-2 border-brand-500 italic text-slate-600 dark:text-slate-300 my-1 text-xs"
                >
                  {renderInlineFormatting(trimmed.replace(/^>\s*/, ''))}
                </blockquote>
              );
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-1.5 text-xs">
                  <span className="text-brand-500 font-bold mt-0.5">•</span>
                  <span className="flex-1">{renderInlineFormatting(trimmed.slice(2))}</span>
                </div>
              );
            }

            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {numMatch[1]}
                  </span>
                  <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
                </div>
              );
            }

            return (
              <p key={lIdx} className="text-xs leading-relaxed">
                {renderInlineFormatting(line)}
              </p>
            );
          })}
        </div>
      );
    });
  }

  function renderFormattedContent(text) {
    const hasActionAssignments = text.includes('[ACTION:OPEN_ASSIGNMENTS]');
    const hasActionAttendance = text.includes('[ACTION:OPEN_ATTENDANCE]');
    const hasActionResources = text.includes('[ACTION:OPEN_RESOURCES]');
    const hasActionTeamFinder = text.includes('[ACTION:OPEN_TEAM_FINDER]');
    const hasActionCalendar = text.includes('[ACTION:OPEN_CALENDAR]');

    const cleanText = text
      .replace(/\[ACTION:OPEN_ASSIGNMENTS\]/g, '')
      .replace(/\[ACTION:OPEN_ATTENDANCE\]/g, '')
      .replace(/\[ACTION:OPEN_RESOURCES\]/g, '')
      .replace(/\[ACTION:OPEN_TEAM_FINDER\]/g, '')
      .replace(/\[ACTION:OPEN_CALENDAR\]/g, '')
      .replace(/\[ACTION:OPEN_COMMUNITY\]/g, '')
      .trim();

    const isDual = cleanText.includes('Possibility 1') && cleanText.includes('Possibility 2');

    if (isDual) {
      const p1Index = cleanText.search(/####?\s*.*?Possibility 1/i);
      const p2Index = cleanText.search(/####?\s*.*?Possibility 2/i);

      const intro = p1Index > 0 ? cleanText.substring(0, p1Index).trim() : '';
      const p1Raw = p2Index > p1Index ? cleanText.substring(p1Index, p2Index).trim() : '';
      const p2Raw = p2Index > p1Index ? cleanText.substring(p2Index).trim() : '';

      return (
        <div className="space-y-3">
          {/* Dual Mode Indicator Banner */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
              <Sparkles className="w-3 h-3" />
              Mode 0 (Default): Two Possibilities Active
            </span>
            <span className="text-[10px] text-slate-400">Web Page Guide + Academic Solver</span>
          </div>

          {intro && (
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {renderMarkdownBlocks(intro)}
            </div>
          )}

          {/* Possibility 1 Card: Web Page Guide */}
          <div className="rounded-xl p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-xs text-blue-950 dark:text-blue-200">
                  Possibility 1: ClassConnect Web Page Guide
                </h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Website Steps
              </span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {renderMarkdownBlocks(p1Raw)}
            </div>

            {/* Quick Action Navigation Buttons */}
            {hasActionAssignments && (
              <button
                type="button"
                onClick={() => navigate('/assignments')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Go to Assignments Page →</span>
              </button>
            )}
            {hasActionAttendance && (
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Go to Attendance Tracker →</span>
              </button>
            )}
            {hasActionResources && (
              <button
                type="button"
                onClick={() => navigate('/resources')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Go to Resource Hub →</span>
              </button>
            )}
            {hasActionTeamFinder && (
              <button
                type="button"
                onClick={() => navigate('/team-finder')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to Team Finder →</span>
              </button>
            )}
            {hasActionCalendar && (
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Go to Academic Calendar →</span>
              </button>
            )}
          </div>

          {/* Possibility 2 Card: Assignment Academic Solver */}
          <div className="rounded-xl p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-xs text-emerald-950 dark:text-emerald-200">
                  Possibility 2: Assignment & Coursework Problem Solver
                </h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                Academic Help
              </span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {renderMarkdownBlocks(p2Raw)}
            </div>

            {/* Quick Follow-up Chips */}
            <div className="mt-3 pt-2.5 border-t border-emerald-200/50 dark:border-emerald-900/50 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 self-center">
                Need more help?
              </span>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Help me write the Transformer attention layer for Assignment 4')}
                className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                💡 Show Transformer PyTorch Code
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Explain the Raft consensus leader election for Lab 5')}
                className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                🔬 Explain Raft Consensus
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Focused single response (Website Guide or Assignment Help)
    const isWebGuide = cleanText.includes('Web Page Guide') || hasActionAssignments || hasActionAttendance || hasActionResources || hasActionTeamFinder || hasActionCalendar;
    const isAcademic = cleanText.includes('Assignment Helper') || cleanText.includes('Problem Solver') || cleanText.includes('```');

    return (
      <div className="text-xs sm:text-sm leading-relaxed space-y-2.5">
        {isWebGuide && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>ClassConnect Website Guide</span>
          </div>
        )}
        {isAcademic && !isWebGuide && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 mb-1">
            <Code2 className="w-3.5 h-3.5" />
            <span>Assignment & Coursework Help</span>
          </div>
        )}

        {renderMarkdownBlocks(cleanText)}

        {hasActionAssignments && (
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Go to Assignments Page →</span>
          </button>
        )}
        {hasActionAttendance && (
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Go to Attendance Tracker →</span>
          </button>
        )}
        {hasActionResources && (
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Go to Resource Hub →</span>
          </button>
        )}
        {hasActionTeamFinder && (
          <button
            type="button"
            onClick={() => navigate('/team-finder')}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Go to Team Finder →</span>
          </button>
        )}
        {hasActionCalendar && (
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Go to Academic Calendar →</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Study Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your virtual campus copilot for platform help, assignment problem solving, and quizzes.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          {[
            { key: 'chat', label: 'Tutor Chat', icon: Bot },
            { key: 'summarize', label: 'Summarizer', icon: FileText },
            { key: 'quiz', label: 'Quiz Maker', icon: HelpCircle },
            { key: 'explain', label: 'Explainer', icon: Lightbulb },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ACADEMIC TUTOR CHAT (WITH 0 DEFAULT & 2 POSSIBILITIES) */}
      {/* ======================================================== */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[660px] overflow-hidden">
          {/* Header row with Mode Selector (0 = Dual Default, 1 = Platform Guide, 2 = Assignment Solver) */}
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
            {/* Smart Auto / Website Guide / Assignment Helper Toggle */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Focus Mode:</span>
              <button
                type="button"
                onClick={() => setChatMode(0)}
                className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 ${
                  chatMode === 0
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                title="Smart Auto: Answers what you ask — Website Doubts OR Assignment Help"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>0. Auto (Default)</span>
              </button>

              <button
                type="button"
                onClick={() => setChatMode(1)}
                className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 ${
                  chatMode === 1
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                title="Website Guide: Only answers questions about ClassConnect web features & navigation"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>1. Website Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setChatMode(2)}
                className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 ${
                  chatMode === 2
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                title="Assignment Helper: Only answers homework solving, code & academic doubts"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>2. Assignment Helper</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-500 self-end sm:self-center">
              <span>Course:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="Deep Learning & AI">Deep Learning (AI405)</option>
                <option value="Distributed Cloud Systems">Distributed Systems (CS301)</option>
                <option value="Data Structures & Algorithms">Algorithms (CS204)</option>
                <option value="Software Engineering & DevOps">DevOps (SE310)</option>
                <option value="Network Security">Security (CYB220)</option>
              </select>
            </div>
          </div>

          {/* Mode 0 Helper Explainer Bar */}
          {chatMode === 0 && (
            <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-600 flex-shrink-0" />
              <span>
                <strong>Smart Auto Mode (Default):</strong> The AI answers what you need — ask any <strong>website doubt</strong> (how to gave/submit assignments, find notes, attendance) or ask for <strong>assignment help</strong> (code, math, homework solutions).
              </span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? 'You' : <Bot className="w-3.5 h-3.5 text-brand-600" />}
                </div>

                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white max-w-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm w-full'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    renderFormattedContent(msg.text)
                  )}

                  <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] opacity-70">
                    <span>{msg.time}</span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:opacity-100 flex items-center gap-1 text-slate-500"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-2.5 max-w-md items-center text-xs text-slate-500 p-2">
                <Bot className="w-4 h-4 animate-spin text-brand-600" />
                <span>AI assistant is formulating response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggested Prompt Chips */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-50/50 dark:bg-slate-800/20 scrollbar-none">
            <span className="text-[10px] font-semibold text-slate-400 uppercase whitespace-nowrap">
              Try:
            </span>
            {[
              'How to gave assignment on web page?',
              'Help me with Assignment 4 (Transformer Attention)',
              'Where can I download lecture notes?',
              'How to check attendance & timetable?',
              'How to find teammates on Team Finder?',
              'Explain Dijkstra algorithm',
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendChatMessage(p)}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 hover:border-brand-500 whitespace-nowrap transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={
                chatMode === 1
                  ? "Ask about ClassConnect (e.g. 'How to submit assignment?', 'Where are notes?')..."
                  : chatMode === 2
                  ? "Ask for assignment help (e.g. 'Help me with Transformer attention code')..."
                  : "Ask a website doubt (e.g. 'How to gave assignment') or get assignment help..."
              }
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputMessage.trim()}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: NOTE SUMMARIZER */}
      {/* ======================================================== */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Input Lecture Notes
              </span>
              <select
                value={summaryFormat}
                onChange={e => setSummaryFormat(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="bullet-points">Bullet Points</option>
                <option value="executive-summary">Executive Summary</option>
                <option value="flashcards">Flashcards</option>
              </select>
            </div>

            <textarea
              rows={11}
              value={summaryInput}
              onChange={e => setSummaryInput(e.target.value)}
              placeholder="Paste study material or lecture text here..."
              className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() =>
                  setSummaryInput(
                    `Raft is a consensus algorithm designed for distributed systems. It decomposes consensus into Leader Election, Log Replication, and Safety. Nodes exist as Follower, Candidate, or Leader. Leaders replicate logs to followers using heartbeats.`
                  )
                }
                className="text-xs text-brand-600 hover:underline"
              >
                Load sample text
              </button>
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || !summaryInput.trim()}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition disabled:opacity-50"
              >
                {isSummarizing ? 'Summarizing...' : 'Summarize'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Summary Result
                </span>
                {summaryOutput && (
                  <button
                    onClick={() => copyToClipboard(summaryOutput, 'sum')}
                    className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                )}
              </div>

              {summaryOutput ? (
                <div className="mt-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {summaryOutput}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  Summary will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: QUIZ GENERATOR */}
      {/* ======================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={e => setQuizTopic(e.target.value)}
                  placeholder="e.g. Data Structures"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Difficulty
                </label>
                <select
                  value={quizDifficulty}
                  onChange={e => setQuizDifficulty(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs self-start sm:self-end transition disabled:opacity-50"
            >
              {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>

          {quizQuestions.length > 0 && (
            <div className="space-y-3">
              {quizQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <span className="text-xs font-semibold text-brand-600">Question {idx + 1}</span>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {q.question}
                  </h4>

                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.answerIndex;

                      let style = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
                      if (showResults) {
                        if (isCorrect) style = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        else if (isChosen) style = 'bg-rose-50 text-rose-800 border-rose-300';
                      } else if (isChosen) {
                        style = 'bg-brand-50 text-brand-800 border-brand-400';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          className={`p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer flex justify-between items-center ${style}`}
                        >
                          <span>{opt}</span>
                          {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-2">
                {!showResults ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-medium"
                  >
                    New Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CONCEPT EXPLAINER */}
      {/* ======================================================== */}
      {activeTab === 'explain' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Concept to Explain
              </label>
              <input
                type="text"
                value={conceptInput}
                onChange={e => setConceptInput(e.target.value)}
                placeholder="e.g. Backpropagation, CAP Theorem, Paxos..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Level
              </label>
              <select
                value={explainMode}
                onChange={e => setExplainMode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="eli5">Simple (ELI5)</option>
                <option value="intuitive">Undergraduate Standard</option>
                <option value="deep-dive">Deep Dive</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExplain}
            disabled={isExplaining || !conceptInput.trim()}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition disabled:opacity-50"
          >
            {isExplaining ? 'Explaining...' : 'Explain Concept'}
          </button>

          {explanationOutput && (
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {explanationOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

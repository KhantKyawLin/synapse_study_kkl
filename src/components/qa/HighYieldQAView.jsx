import React, { useState, useMemo, useEffect } from 'react';
import qaData from '../../data/immunology_qa.json';
import SpeedDrillModal from './SpeedDrillModal';
import { 
  BookOpen, Search, Layers, Table, HelpCircle, ChevronDown, 
  ChevronUp, Sparkles, CheckCircle2, Bookmark, Copy, Check, 
  Filter, Award, Eye, EyeOff, ShieldCheck, Zap, Volume2, VolumeX, Flame 
} from 'lucide-react';

export default function HighYieldQAView() {
  const [activeTab, setActiveTab] = useState('definitions'); // 'definitions' | 'questions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all'); // 'all' | 'comparison' | 'long' | 'short'
  const [expandedQuestions, setExpandedQuestions] = useState({ sq_1: true, sq_2: true });
  const [copiedId, setCopiedId] = useState(null);
  const [selfTestMode, setSelfTestMode] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const [isDrillOpen, setIsDrillOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const { metadata, definitions = [], questions = [] } = qaData;

  // Clean up audio speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleReveal = (id) => {
    setRevealedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-To-Speech Pronunciation / Narration
  const speakText = (text, id) => {
    if (!('speechSynthesis' in window)) {
      alert('Audio speech synthesis is not supported on this browser.');
      return;
    }

    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // clear academic speed
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    setPlayingAudioId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
  };

  // Filtered Definitions
  const filteredDefinitions = useMemo(() => {
    return definitions.filter((def) => {
      const matchesCategory = selectedCategory === 'All' || def.category === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        def.term.toLowerCase().includes(query) ||
        def.definition.toLowerCase().includes(query) ||
        (def.notes && def.notes.toLowerCase().includes(query)) ||
        def.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [definitions, selectedCategory, searchQuery]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesType =
        questionTypeFilter === 'all'
          ? true
          : questionTypeFilter === 'comparison'
          ? q.type === 'comparison'
          : questionTypeFilter === 'long'
          ? q.type === 'long'
          : q.type === 'short';

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        q.title.toLowerCase().includes(query) ||
        q.question.toLowerCase().includes(query) ||
        q.summary.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query);

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [questions, selectedCategory, questionTypeFilter, searchQuery]);

  // Extract unique categories for current tab
  const activeCategories = useMemo(() => {
    const set = new Set();
    if (activeTab === 'definitions') {
      definitions.forEach((d) => set.add(d.category));
    } else {
      questions.forEach((q) => set.add(q.category));
    }
    return ['All', ...Array.from(set).sort()];
  }, [activeTab, definitions, questions]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-slate-100 to-white dark:from-[#161b22] dark:to-[#0d1117] border border-slate-200 dark:border-cyanPrimary/40 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-cyanPrimary/5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-sky-700 dark:text-cyanPrimary shadow-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Immunology High-Yield Q&A
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/30">
                Study Center
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              36 Medical Definitions • 27 Short & Long Exam Questions (SQs) • Audio Read-Aloud
            </p>
          </div>
        </div>

        {/* Action Controls (Speed Drill & Self-Test Mode) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Speed-Drill Launcher Button */}
          <button
            onClick={() => {
              stopAudio();
              setIsDrillOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyanPrimary to-sky-600 hover:from-cyanPrimary/90 hover:to-sky-500 text-white shadow-md shadow-cyanPrimary/25 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>⚡ Launch Speed-Drill Mode</span>
          </button>

          {/* Self-Test Mode Switch */}
          <button
            onClick={() => setSelfTestMode(!selfTestMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              selfTestMode
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-white dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-cyanPrimary/40'
            }`}
          >
            {selfTestMode ? <EyeOff className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Eye className="w-4 h-4 text-sky-600 dark:text-cyanPrimary" />}
            <span>{selfTestMode ? 'Self-Test: Active' : 'Self-Test Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher (Definitions vs SQ Questions) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-[#161b22] border border-slate-300 dark:border-slate-800 rounded-2xl mb-6 max-w-md shadow-inner">
        <button
          onClick={() => {
            setActiveTab('definitions');
            setSelectedCategory('All');
            setSearchQuery('');
            stopAudio();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'definitions'
              ? 'bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Definitions ({definitions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('questions');
            setSelectedCategory('All');
            setSearchQuery('');
            stopAudio();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Short Questions ({questions.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={activeTab === 'definitions' ? 'Search terminology or definition...' : 'Search question or concept...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="custom-select text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyanPrimary cursor-pointer max-w-[200px] truncate"
          >
            {activeCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter Buttons (Only on Questions Tab) */}
        {activeTab === 'questions' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setQuestionTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                questionTypeFilter === 'all' ? 'bg-cyanPrimary text-white shadow-md' : 'bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setQuestionTypeFilter('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                questionTypeFilter === 'comparison' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-[#0d1117] text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Tables</span>
            </button>
            <button
              onClick={() => setQuestionTypeFilter('long')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                questionTypeFilter === 'long' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-[#0d1117] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white'
              }`}
            >
              Comprehensive SQs
            </button>
            <button
              onClick={() => setQuestionTypeFilter('short')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                questionTypeFilter === 'short' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 dark:bg-[#0d1117] text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white'
              }`}
            >
              Targeted SQs
            </button>
          </div>
        )}
      </div>

      {/* DEFINITIONS TAB VIEW */}
      {activeTab === 'definitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDefinitions.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No Definitions Match Your Search</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filter.</p>
            </div>
          ) : (
            filteredDefinitions.map((def) => {
              const isRevealed = revealedCards[def.id] || !selfTestMode;
              const isSpeaking = playingAudioId === def.id;

              return (
                <div
                  key={def.id}
                  className={`p-5 bg-white dark:bg-[#161b22] border rounded-2xl transition-all shadow-md shadow-slate-200/40 dark:shadow-none flex flex-col justify-between ${
                    isSpeaking ? 'border-cyanPrimary ring-1 ring-cyanPrimary/40' : 'border-slate-200 dark:border-slate-800 hover:border-cyanPrimary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          <span>{def.term}</span>
                        </h3>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyanPrimary/10 dark:bg-cyanPrimary/10 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/25">
                          {def.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Audio Speak Button */}
                        <button
                          onClick={() => speakText(`${def.term}. Definition: ${def.definition}. ${def.notes ? 'High yield: ' + def.notes : ''}`, def.id)}
                          title={isSpeaking ? 'Stop Audio' : 'Listen to Pronunciation'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSpeaking
                              ? 'bg-cyanPrimary text-white border-cyanPrimary animate-pulse'
                              : 'bg-slate-100 dark:bg-[#0d1117] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-cyanGlow hover:border-cyanPrimary/50'
                          }`}
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary" />}
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(`${def.term}:\n${def.definition}\n${def.notes || ''}`, def.id)}
                          title="Copy Definition"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-cyanPrimary/50 transition-all"
                        >
                          {copiedId === def.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Self-Test Toggle Mask */}
                    {selfTestMode && !isRevealed ? (
                      <button
                        onClick={() => toggleReveal(def.id)}
                        className="w-full py-6 px-4 bg-slate-50 dark:bg-[#0d1117] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-cyanGlow hover:border-cyanPrimary/50 transition-all flex flex-col items-center justify-center gap-1.5 my-2"
                      >
                        <Eye className="w-4 h-4 text-sky-600 dark:text-cyanPrimary" />
                        <span>Click to reveal definition</span>
                      </button>
                    ) : (
                      <div className="animate-fadeIn">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 mb-3">
                          {def.definition}
                        </p>

                        {def.properties && (
                          <div className="space-y-1 my-2 pl-2 border-l-2 border-cyanPrimary/40">
                            {def.properties.map((prop, pIdx) => (
                              <p key={pIdx} className="text-[11px] text-slate-600 dark:text-slate-400">
                                • {prop}
                              </p>
                            ))}
                          </div>
                        )}

                        {def.notes && (
                          <div className="p-2.5 bg-sky-50 dark:bg-[#0d1117] border border-sky-200 dark:border-slate-800 rounded-xl text-[11px] text-sky-900 dark:text-cyanGlow/90 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary shrink-0 mt-0.5" />
                            <span><strong>High-Yield:</strong> {def.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selfTestMode && isRevealed && (
                    <button
                      onClick={() => toggleReveal(def.id)}
                      className="self-end text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-2"
                    >
                      Hide Answer
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* QUESTIONS (SQ) TAB VIEW */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Layers className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No Questions Match Your Search</p>
              <p className="text-xs text-slate-500 mt-1">Try changing your filter options.</p>
            </div>
          ) : (
            filteredQuestions.map((q, index) => {
              const isExpanded = expandedQuestions[q.id];
              const isComparison = q.type === 'comparison';
              const isSpeaking = playingAudioId === q.id;
              const isRevealed = revealedCards[q.id] || !selfTestMode;

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-[#161b22] border rounded-2xl overflow-hidden transition-all shadow-md dark:shadow-black/20 ${
                    isSpeaking ? 'border-cyanPrimary ring-1 ring-cyanPrimary/40' : 'border-slate-200 dark:border-slate-800 hover:border-cyanPrimary/30'
                  }`}
                >
                  {/* Question Header Card */}
                  <div
                    onClick={() => toggleQuestion(q.id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-[#161b22] dark:to-[#12161c] hover:bg-slate-100 dark:hover:bg-[#1a2029] transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                        isComparison 
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300' 
                          : q.type === 'long'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isComparison ? <Table className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/40">
                            SQ {q.num || index + 1}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {q.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isComparison
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              : q.type === 'long'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}>
                            {isComparison ? 'Comparison Table' : q.type === 'long' ? 'Comprehensive SQ' : 'Targeted SQ'}
                          </span>
                          {selfTestMode && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <EyeOff className="w-2.5 h-2.5" /> Self-Test
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {/* Audio Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(`${q.title}. ${q.question}. Summary: ${q.summary || ''}`, q.id);
                        }}
                        title={isSpeaking ? 'Stop Audio' : 'Listen to Question'}
                        className={`p-2 rounded-xl border transition-all ${
                          isSpeaking
                            ? 'bg-cyanPrimary text-white border-cyanPrimary animate-pulse'
                            : 'bg-slate-100 dark:bg-[#0d1117] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-cyanGlow hover:border-cyanPrimary/50'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-600 dark:text-cyanPrimary" />}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(q.question + '\n\n' + (q.summary || ''), q.id);
                        }}
                        title="Copy Question"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                      >
                        {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0d1117] text-slate-500 dark:text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Answer Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0d1117]/80 animate-fadeIn">
                      {/* Self-Test Toggle Mask */}
                      {selfTestMode && !isRevealed ? (
                        <button
                          onClick={() => toggleReveal(q.id)}
                          className="w-full py-8 px-4 bg-white dark:bg-[#0d1117] border-2 border-dashed border-cyanPrimary/40 rounded-xl text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-cyanGlow hover:border-cyanPrimary hover:bg-sky-50/50 dark:hover:bg-cyanPrimary/5 transition-all flex flex-col items-center justify-center gap-2 my-1 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-5 h-5 text-sky-600 dark:text-cyanPrimary animate-bounce" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Self-Test Mode Active</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal max-w-sm">
                            Test your recall on this Short Question, then click here to reveal the key concepts, tables & mechanisms!
                          </span>
                        </button>
                      ) : (
                        <div className="animate-fadeIn">
                          {/* Summary Banner */}
                          {q.summary && (
                            <div className="p-3 bg-sky-50 dark:bg-cyanPrimary/10 border border-sky-200 dark:border-cyanPrimary/30 rounded-xl text-xs text-sky-900 dark:text-cyanGlow mb-4 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyanPrimary shrink-0 mt-0.5" />
                              <span><strong>Key Concept:</strong> {q.summary}</span>
                            </div>
                          )}

                          {/* Comparison Table View */}
                          {q.table && (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] mb-4 shadow-sm">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 dark:bg-[#0d1117] text-slate-800 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                                  <tr>
                                    {q.table.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-4 py-3 border-r border-slate-200 dark:border-slate-800/80 last:border-none">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                                  {q.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`px-4 py-3 border-r border-slate-200 dark:border-slate-800/70 last:border-none ${
                                            cIdx === 0 ? 'font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0d1117]/40' : 'text-slate-700 dark:text-slate-300'
                                          }`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Structured Sections & Mechanisms */}
                          {q.sections && (
                            <div className="space-y-3">
                              {q.sections.map((sec, sIdx) => (
                                <div key={sIdx} className="p-3.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/90 rounded-xl shadow-sm">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-cyanPrimary"></span>
                                    <span>{sec.heading}</span>
                                  </h4>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pl-3.5">
                                    {sec.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Self-Test Hide Button */}
                          {selfTestMode && (
                            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Answer & Mechanisms Revealed
                              </span>
                              <button
                                onClick={() => toggleReveal(q.id)}
                                className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
                              >
                                Hide Answer 🔒
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SPEED DRILL ACTIVE RECALL MODAL */}
      <SpeedDrillModal
        isOpen={isDrillOpen}
        onClose={() => setIsDrillOpen(false)}
        definitions={definitions}
        questions={questions}
        playingAudioId={playingAudioId}
        onSpeak={speakText}
        onStopAudio={stopAudio}
      />
    </div>
  );
}

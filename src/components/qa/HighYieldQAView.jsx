import React, { useState, useMemo } from 'react';
import qaData from '../../data/immunology_qa.json';
import { 
  BookOpen, Search, Layers, Table, HelpCircle, ChevronDown, 
  ChevronUp, Sparkles, CheckCircle2, Bookmark, Copy, Check, 
  Filter, Award, Eye, EyeOff, ShieldCheck, Zap 
} from 'lucide-react';

export default function HighYieldQAView() {
  const [activeTab, setActiveTab] = useState('definitions'); // 'definitions' | 'questions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all'); // 'all' | 'comparison' | 'long' | 'short'
  const [expandedQuestions, setExpandedQuestions] = useState({ qa_1: true, qa_2: true });
  const [copiedId, setCopiedId] = useState(null);
  const [selfTestMode, setSelfTestMode] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});

  const { metadata, definitions = [], questions = [] } = qaData;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-cyanPrimary/40 rounded-2xl shadow-xl shadow-cyanPrimary/5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary shadow-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Immunology High-Yield Q&A
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyanPrimary/20 text-cyanGlow border border-cyanPrimary/30">
                Study Guide
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated medical terminology, comparison tables, and short & long exam questions (SQ / LQ)
            </p>
          </div>
        </div>

        {/* Self-Test Mode Switch */}
        <button
          onClick={() => setSelfTestMode(!selfTestMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            selfTestMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-[#0d1117] text-slate-300 border-slate-700 hover:border-cyanPrimary/40'
          }`}
        >
          {selfTestMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-cyanPrimary" />}
          <span>{selfTestMode ? 'Self-Test Mode: Active' : 'Self-Test Mode'}</span>
        </button>
      </div>

      {/* Main Tab Switcher (Definitions vs SQ / LQ Questions) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#161b22] border border-slate-800 rounded-2xl mb-6 max-w-md">
        <button
          onClick={() => {
            setActiveTab('definitions');
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'definitions'
              ? 'bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25'
              : 'text-slate-400 hover:text-white'
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
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>SQ & Long Questions ({questions.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-[#161b22] border border-slate-800 rounded-2xl mb-6">
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
            className="w-full bg-[#0d1117] border border-slate-700 text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d1117] border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyanPrimary cursor-pointer max-w-[200px] truncate"
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
                questionTypeFilter === 'all' ? 'bg-cyanPrimary text-white shadow-md' : 'bg-[#0d1117] text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setQuestionTypeFilter('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                questionTypeFilter === 'comparison' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#0d1117] text-purple-300 hover:text-white'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Tables</span>
            </button>
            <button
              onClick={() => setQuestionTypeFilter('long')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                questionTypeFilter === 'long' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#0d1117] text-emerald-300 hover:text-white'
              }`}
            >
              Long Questions
            </button>
            <button
              onClick={() => setQuestionTypeFilter('short')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                questionTypeFilter === 'short' ? 'bg-amber-600 text-white shadow-md' : 'bg-[#0d1117] text-amber-300 hover:text-white'
              }`}
            >
              Short Questions
            </button>
          </div>
        )}
      </div>

      {/* DEFINITIONS TAB VIEW */}
      {activeTab === 'definitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDefinitions.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-[#161b22] border border-slate-800 rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No Definitions Match Your Search</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filter.</p>
            </div>
          ) : (
            filteredDefinitions.map((def) => {
              const isRevealed = revealedCards[def.id] || !selfTestMode;
              return (
                <div
                  key={def.id}
                  className="p-5 bg-[#161b22] border border-slate-800 hover:border-cyanPrimary/40 rounded-2xl transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                          <span>{def.term}</span>
                        </h3>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyanPrimary/10 text-cyanGlow border border-cyanPrimary/25">
                          {def.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(`${def.term}:\n${def.definition}\n${def.notes || ''}`, def.id)}
                        title="Copy Definition"
                        className="p-1.5 rounded-lg bg-[#0d1117] border border-slate-700 text-slate-400 hover:text-white hover:border-cyanPrimary/50 transition-all shrink-0"
                      >
                        {copiedId === def.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Self-Test Toggle Mask */}
                    {selfTestMode && !isRevealed ? (
                      <button
                        onClick={() => toggleReveal(def.id)}
                        className="w-full py-6 px-4 bg-[#0d1117] border border-dashed border-slate-700 rounded-xl text-center text-xs font-bold text-slate-400 hover:text-cyanGlow hover:border-cyanPrimary/50 transition-all flex flex-col items-center justify-center gap-1.5 my-2"
                      >
                        <Eye className="w-4 h-4 text-cyanPrimary" />
                        <span>Click to reveal definition</span>
                      </button>
                    ) : (
                      <div className="animate-fadeIn">
                        <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-3">
                          {def.definition}
                        </p>

                        {def.properties && (
                          <div className="space-y-1 my-2 pl-2 border-l-2 border-cyanPrimary/40">
                            {def.properties.map((prop, pIdx) => (
                              <p key={pIdx} className="text-[11px] text-slate-400">
                                • {prop}
                              </p>
                            ))}
                          </div>
                        )}

                        {def.notes && (
                          <div className="p-2.5 bg-[#0d1117] border border-slate-800 rounded-xl text-[11px] text-cyanGlow/90 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-cyanPrimary shrink-0 mt-0.5" />
                            <span><strong>High-Yield:</strong> {def.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selfTestMode && isRevealed && (
                    <button
                      onClick={() => toggleReveal(def.id)}
                      className="self-end text-[10px] text-slate-500 hover:text-slate-300 mt-2"
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

      {/* QUESTIONS (SQ / LQ) TAB VIEW */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22] border border-slate-800 rounded-2xl">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No Questions Match Your Search</p>
              <p className="text-xs text-slate-500 mt-1">Try changing your filter options.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isExpanded = expandedQuestions[q.id];
              const isComparison = q.type === 'comparison';

              return (
                <div
                  key={q.id}
                  className="bg-[#161b22] border border-slate-800 hover:border-cyanPrimary/30 rounded-2xl overflow-hidden transition-all shadow-lg shadow-black/20"
                >
                  {/* Question Header Card */}
                  <div
                    onClick={() => toggleQuestion(q.id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4 bg-gradient-to-r from-[#161b22] to-[#12161c] hover:bg-[#1a2029] transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                        isComparison 
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' 
                          : q.type === 'long'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}>
                        {isComparison ? <Table className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            {q.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isComparison
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : q.type === 'long'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {isComparison ? 'Comparison Table' : q.type === 'long' ? 'Long Question' : 'Short Question'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(q.question + '\n\n' + (q.summary || ''), q.id);
                        }}
                        title="Copy Question"
                        className="p-2 rounded-xl bg-[#0d1117] border border-slate-700 text-slate-400 hover:text-white transition-all"
                      >
                        {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <div className="p-2 rounded-xl bg-[#0d1117] text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Answer Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800 bg-[#0d1117]/80 animate-fadeIn">
                      {/* Summary Banner */}
                      {q.summary && (
                        <div className="p-3 bg-cyanPrimary/10 border border-cyanPrimary/30 rounded-xl text-xs text-cyanGlow mb-4 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyanPrimary shrink-0 mt-0.5" />
                          <span><strong>Key Concept:</strong> {q.summary}</span>
                        </div>
                      )}

                      {/* Comparison Table View */}
                      {q.table && (
                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#161b22] mb-4">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#0d1117] text-slate-300 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                              <tr>
                                {q.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="px-4 py-3 border-r border-slate-800/80 last:border-none">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                              {q.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`px-4 py-3 border-r border-slate-800/70 last:border-none ${
                                        cIdx === 0 ? 'font-bold text-white bg-[#0d1117]/40' : 'text-slate-300'
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
                            <div key={sIdx} className="p-3.5 bg-[#161b22] border border-slate-800/90 rounded-xl">
                              <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyanPrimary"></span>
                                <span>{sec.heading}</span>
                              </h4>
                              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-3.5">
                                {sec.content}
                              </p>
                            </div>
                          ))}
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
    </div>
  );
}

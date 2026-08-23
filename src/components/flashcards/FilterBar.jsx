import React from 'react';
import { Bookmark, CheckCircle2, Layers } from 'lucide-react';

export default function FilterBar({
  modules,
  selectedModule,
  setSelectedModule,
  categories,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  totalCount,
  reviewCount,
  masteredCount,
}) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto mb-6">
      {/* Subject & Category Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
        {/* Module Select */}
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
            Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="custom-select w-full"
          >
            <option value="All">All Modules</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="custom-select w-full"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Segmented Buttons (All | Needs Review | Mastered) */}
      <div className="flex items-center justify-between p-1 bg-[#13171f] border border-slate-800 rounded-xl">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All ({totalCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('review')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            statusFilter === 'review'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Needs Review ({reviewCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('mastered')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            statusFilter === 'mastered'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mastered ({masteredCount})</span>
        </button>
      </div>
    </div>
  );
}

import React from 'react';

export default function FilterBar({
  modules,
  selectedModule,
  setSelectedModule,
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl mx-auto mb-6">
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
  );
}

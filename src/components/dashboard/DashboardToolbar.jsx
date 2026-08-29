import React from 'react';

export default function DashboardToolbar({
  modules,
  selectedModule,
  setSelectedModule,
  categories,
  selectedCategory,
  setSelectedCategory,
  items,
  selectedItem,
  setSelectedItem,
}) {
  return (
    <div className="w-full bg-white dark:bg-[#161b22]/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-sm dark:shadow-xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Module Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
            Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="custom-select w-full"
          >
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Main Category Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
            Main Category
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

        {/* Sub Category / Item Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
            Sub Category / Item
          </label>
          <select
            value={selectedItem ? selectedItem.Name : ''}
            onChange={(e) => {
              const found = items.find((item) => item.Name === e.target.value);
              if (found) setSelectedItem(found);
            }}
            className="custom-select w-full"
          >
            {items.map((item) => (
              <option key={item.Name} value={item.Name}>
                {item.Name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

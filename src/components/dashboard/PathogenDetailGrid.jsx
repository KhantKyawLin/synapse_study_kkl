import React from 'react';
import KatexText from '../KatexText';

export default function PathogenDetailGrid({ item }) {
  if (!item) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#161b22]/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Select an item to view details.</p>
      </div>
    );
  }

  // Define accent colors for cards in light and dark modes
  const getCardAccent = (index) => {
    const accents = [
      { border: 'border-sky-300 dark:border-cyanPrimary/30', header: 'text-sky-700 dark:text-cyanPrimary', bg: 'bg-sky-50/70 dark:bg-[#161b22]/80' },
      { border: 'border-rose-300 dark:border-rose-500/30', header: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-[#1c1822]/80' },
      { border: 'border-emerald-300 dark:border-emerald-500/30', header: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-[#16221c]/80' },
      { border: 'border-amber-300 dark:border-amber-500/30', header: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-[#221f16]/80' },
      { border: 'border-indigo-300 dark:border-indigo-500/30', header: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-[#181a26]/80' },
      { border: 'border-teal-300 dark:border-teal-500/30', header: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50/70 dark:bg-[#162222]/80' },
    ];
    return accents[index % accents.length];
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          <KatexText text={item.Name} />
        </h2>
        {item.Tag && (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/40 shadow-sm">
            {item.Tag}
          </span>
        )}
      </div>

      {/* 3-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {item.details && item.details.map((detail, idx) => {
          const accent = getCardAccent(idx);
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${accent.border} ${accent.bg} backdrop-blur-md flex flex-col shadow-sm dark:shadow-lg transition-all duration-200 hover:border-cyanPrimary/60`}
            >
              <h3 className={`text-base font-bold mb-2.5 ${accent.header}`}>
                <KatexText text={detail.title} />
              </h3>
              <p className="text-sm font-normal text-slate-800 dark:text-slate-200 leading-relaxed m-0">
                <KatexText text={detail.content} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

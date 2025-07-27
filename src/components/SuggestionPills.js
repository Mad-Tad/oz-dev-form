import React from 'react';
import clsx from 'clsx';

export default function SuggestionPills({ options = [], onSelect, selected }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={clsx(
            'px-3 py-1 rounded-full border text-sm transition-all',
            selected === opt ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-primary-50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
} 
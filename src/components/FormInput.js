import React from 'react';
import SuggestionPills from './SuggestionPills';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  suggestions,
  required = false,
  placeholder,
}) {
  const handleSelectSuggestion = (opt) => {
    onChange({ target: { name, value: opt } });
  };

  return (
    <div>
      <label htmlFor={name} className="block font-semibold mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      )}
      {suggestions && (
        <SuggestionPills options={suggestions} onSelect={handleSelectSuggestion} selected={value} />
      )}
    </div>
  );
} 
import { useState, useRef } from 'react';

let debounceTimer;

export default function SearchBar({ onSearch, onClear }) {
  const [value, setValue]     = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef              = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => onSearch(val), 300);
  };

  const handleClear = () => {
    setValue('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5
                    transition-all duration-200
                    ${focused
                      ? 'border border-accent/30 shadow-glow-sm'
                      : 'border border-border-2 hover:border-border-3'
                    }`}
        style={{
          background: focused
            ? 'rgba(99,102,241,0.04)'
            : 'rgba(255,255,255,0.025)',
        }}
      >
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-colors duration-200
                      ${focused ? 'text-accent-light' : 'text-txt-muted'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by username..."
          className="flex-1 bg-transparent text-txt-primary placeholder-txt-muted
                     text-[13px] font-medium focus:outline-none min-w-0"
        />

        {value && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 w-5 h-5 rounded-full bg-border-3
                       flex items-center justify-center text-txt-muted
                       hover:text-txt-primary hover:bg-surface-3
                       transition-all duration-150"
          >
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
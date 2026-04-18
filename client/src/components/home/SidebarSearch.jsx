import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import Avatar from '../ui/Avatar';
import { useDebounce } from '../../hooks/useDebounce';

export default function SidebarSearch({ onSelectUser }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debouncedQuery        = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); return; }
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/users/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [debouncedQuery]);

  const handleSelect = (user) => {
    onSelectUser(user._id);
    setQuery('');
    setResults([]);
    setFocused(false);
  };

  return (
    <div className="relative">
      {/* Input */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                   transition-all duration-200"
        style={{
          background:   'rgba(255,255,255,0.03)',
          border:       focused
            ? '1px solid rgba(99,102,241,0.3)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow:    focused ? '0 0 0 3px rgba(99,102,241,0.06)' : 'none',
        }}
      >
        <svg
          className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
          style={{ color: focused ? '#6366f1' : '#383848' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search by username..."
          autoComplete="off"
          spellCheck={false}
          style={{
            flex:        1,
            background:  'transparent',
            border:      'none',
            outline:     'none',
            color:       '#e0e0e0',
            fontSize:    '13px',
            caretColor:  '#6366f1',
          }}
          className="placeholder-[#303040]"
        />

        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0"
            style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border:     'none', borderRadius: '50%',
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#505060', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {focused && query.length >= 2 && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 rounded-xl
                     overflow-hidden z-50 animate-slide-down"
          style={{
            background: 'rgba(12,12,18,0.99)',
            border:     '1px solid rgba(255,255,255,0.07)',
            boxShadow:  '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Top shimmer */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
          }} />

          {results.length > 0 ? (
            results.map((u, i) => (
              <button
                key={u._id}
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  handleSelect(u);
                }}
                className="w-full flex items-center gap-3 px-4 py-3
                           text-left transition-all duration-150"
                style={{
                  borderBottom: i < results.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={u.avatar?.url} username={u.username} size={36} />
                  {u.isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                      style={{
                        background: '#22c55e',
                        border:     '2px solid #0c0c12',
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate"
                    style={{ color: '#e0e0e0' }}>
                    @{u.username}
                  </p>
                  {u.bio && (
                    <p className="text-[11px] truncate" style={{ color: '#404050' }}>
                      {u.bio}
                    </p>
                  )}
                </div>
                {u.isOnline ? (
                  <span className="text-[10px] font-semibold flex-shrink-0"
                    style={{ color: '#4ade80' }}>
                    Online
                  </span>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: '#2a2a3a' }}
                    fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))
          ) : !loading ? (
            <div className="flex flex-col items-center py-6 px-4">
              <p className="text-[12px]" style={{ color: '#404050' }}>
                No users found for{' '}
                <span style={{ color: '#6366f1' }}>"{query}"</span>
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
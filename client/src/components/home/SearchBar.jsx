import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import Avatar from '../ui/Avatar';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate              = useNavigate();
  const debouncedQuery        = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); return; }
    const search = async () => {
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
    search();
  }, [debouncedQuery]);

  const handleSelect = (user) => {
    navigate(`/chat/${user._id}`);
    setQuery('');
    setResults([]);
  };

  const showDropdown = focused && query.length >= 2;

  return (
    <div className="relative px-4 py-3 z-10">
      {/* ── Input ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl
                   transition-all duration-200"
        style={{
          background:   focused
            ? 'rgba(20,20,20,0.95)'
            : 'rgba(14,14,14,0.8)',
          border:       focused
            ? '1px solid rgba(99,102,241,0.35)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow:    focused
            ? '0 0 0 3px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.3)'
            : '0 4px 16px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Search icon */}
        <svg
          className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
          style={{ color: focused ? '#6366f1' : '#404040' }}
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
          placeholder="Search users..."
          autoComplete="off"
          spellCheck={false}
          style={{
            background:  'transparent',
            color:       '#f0f0f0',
            fontSize:    '14px',
            outline:     'none',
            border:      'none',
            flex:        1,
            caretColor:  '#6366f1',
          }}
          className="placeholder-[#404040]"
        />

        {/* Right side — spinner or clear */}
        {loading ? (
          <svg
            className="w-4 h-4 flex-shrink-0 animate-spin"
            style={{ color: '#6366f1' }}
            fill="none" viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center
                       justify-center transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color:      '#606060',
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div
          className="absolute left-4 right-4 top-full mt-1.5 rounded-2xl
                     overflow-hidden z-50 animate-slide-down"
          style={{
            background:   'rgba(13,13,13,0.98)',
            border:       '1px solid rgba(255,255,255,0.07)',
            boxShadow:    '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Top shimmer */}
          <div
            className="h-px w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            }}
          />

          {results.length > 0 ? (
            results.map((user, i) => (
              <button
                key={user._id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5
                           text-left transition-all duration-150"
                style={{
                  borderBottom: i < results.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={user.avatar?.url}
                    username={user.username}
                    size={38}
                  />
                  {user.isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                      style={{
                        background: '#22c55e',
                        border:     '2px solid #0d0d0d',
                        boxShadow:  '0 0 4px rgba(34,197,94,0.4)',
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold truncate"
                    style={{ color: '#f0f0f0' }}
                  >
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p
                      className="text-[12px] truncate mt-0.5"
                      style={{ color: '#505050' }}
                    >
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Online badge */}
                {user.isOnline ? (
                  <span
                    className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border:     '1px solid rgba(34,197,94,0.2)',
                      color:      '#4ade80',
                    }}
                  >
                    Online
                  </span>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: '#333' }}
                    fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))
          ) : (
            /* No results */
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: 'rgba(99,102,241,0.06)',
                  border:     '1px solid rgba(99,102,241,0.1)',
                }}
              >
                <svg className="w-5 h-5" style={{ color: '#4b4b6b' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium" style={{ color: '#404040' }}>
                No users found for
              </p>
              <p
                className="text-[13px] font-semibold mt-0.5"
                style={{ color: '#6366f1' }}
              >
                "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default function ReadReceipt({ status, mini = false }) {
  const size = mini ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (!status) return null;

  if (status === 'sent') {
    return (
      <svg className={`${size} text-txt-muted flex-shrink-0`}
        viewBox="0 0 16 16" fill="none">
        <path d="M3 8l4 4 6-7" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'delivered') {
    return (
      <span className="inline-flex items-center">
        <svg className={`${size} text-txt-muted flex-shrink-0 -mr-1.5`}
          viewBox="0 0 16 16" fill="none">
          <path d="M2 8l4 4 6-7" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className={`${size} text-txt-muted flex-shrink-0`}
          viewBox="0 0 16 16" fill="none">
          <path d="M2 8l4 4 6-7" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (status === 'read') {
    return (
      <span className="inline-flex items-center">
        <svg className={`${size} flex-shrink-0 -mr-1.5`}
          viewBox="0 0 16 16" fill="none"
          style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' }}>
          <path d="M2 8l4 4 6-7" stroke="#818cf8"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className={`${size} flex-shrink-0`}
          viewBox="0 0 16 16" fill="none"
          style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' }}>
          <path d="M2 8l4 4 6-7" stroke="#818cf8"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return null;
}
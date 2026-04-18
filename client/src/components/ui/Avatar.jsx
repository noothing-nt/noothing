export default function Avatar({ src, username, size = 40, className = '' }) {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '??';

  const colors = [
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600',
    'from-blue-500 to-cyan-600',
    'from-orange-500 to-amber-600',
    'from-teal-500 to-cyan-600',
  ];

  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;

  if (src) {
    return (
      <img
        src={src}
        alt={username || 'User'}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="text-white font-bold select-none"
        style={{ fontSize: Math.max(10, size * 0.35) }}
      >
        {initials}
      </span>
    </div>
  );
}
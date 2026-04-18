const STICKERS = [
  { emoji: '😀', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif' },
  { emoji: '❤️', url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif' },
  { emoji: '🔥', url: 'https://media.giphy.com/media/l3vRfNA1p0kkO8KHq/giphy.gif' },
  { emoji: '😂', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { emoji: '👏', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { emoji: '😎', url: 'https://media.giphy.com/media/3o7aCTfyhYawdOXcFW/giphy.gif' },
  { emoji: '🎉', url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif' },
  { emoji: '👋', url: 'https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif' },
  { emoji: '💯', url: 'https://media.giphy.com/media/3oEdva9BUHPHz2sSE8/giphy.gif' },
  { emoji: '🤔', url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif' },
  { emoji: '😭', url: 'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif' },
  { emoji: '🙏', url: 'https://media.giphy.com/media/xT9IgG50Lg7russbDa/giphy.gif' },
];

export default function StickerPicker({ onSelect, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute bottom-full left-0 mb-2 z-50 p-3 rounded-2xl
                   animate-slide-up w-[280px]"
        style={{
          background: 'rgba(12,12,18,0.99)',
          border:     '1px solid rgba(255,255,255,0.08)',
          boxShadow:  '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          height: 1, marginBottom: 12,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
        }} />

        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1"
          style={{ color: '#404050' }}
        >
          Stickers
        </p>

        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s.url)}
              className="aspect-square rounded-xl overflow-hidden transition-all
                         hover:scale-110 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <img
                src={s.url}
                alt={s.emoji}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
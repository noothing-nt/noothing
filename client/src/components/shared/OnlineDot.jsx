export default function OnlineDot({ className = '', showRing = false }) {
  return (
    <span className={`relative flex-shrink-0 ${className}`}>
      {showRing && (
        <span className="absolute inset-0 rounded-full bg-online animate-ping opacity-40" />
      )}
      <span
        className="block w-3 h-3 rounded-full border-2 border-void"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a)',
          boxShadow: '0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(34,197,94,0.2)',
        }}
      />
    </span>
  );
}
export default function InputField({
  label,
  hint,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#808080] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-[#141414] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#404040] outline-none transition-colors focus:border-indigo-500/60 ${
          error ? 'border-red-500/50' : 'border-white/8'
        }`}
        {...props}
      />
      {hint && !error && (
        <p className="text-[11px] text-[#404040]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
}
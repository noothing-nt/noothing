import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-center p-8">
      <p className="text-6xl mb-4">👻</p>
      <h1 className="text-white text-2xl font-black mb-2">404 — Nothing Here</h1>
      <p className="text-[#404040] text-sm mb-8">This page doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
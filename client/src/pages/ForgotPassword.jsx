import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email.');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Forgot Password</h1>
          <p className="text-[#404040] text-sm">
            Enter your recovery email to receive a reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">📧</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">Check your inbox</p>
              <p className="text-[#505050] text-sm">
                If an account with that email exists, a reset link has been sent.
                The link expires in <strong className="text-white">15 minutes</strong>.
              </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Recovery Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
              />
              <Button type="submit" loading={loading} fullWidth>
                Send Reset Link
              </Button>
            </form>
            <button
              onClick={() => navigate('/auth')}
              className="w-full text-center text-sm text-[#505050] hover:text-white transition-colors py-2"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
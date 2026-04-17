import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

export default function IncomingCall() {
  const { socket }   = useSocket();
  const navigate     = useNavigate();
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', (data) => {
      setCall(data);
      // Auto-reject after 30 seconds
      setTimeout(() => setCall(null), 30000);
    });

    socket.on('call:ended', () => setCall(null));

    return () => {
      socket.off('call:incoming');
      socket.off('call:ended');
    };
  }, [socket]);

  if (!call) return null;

  const accept = () => {
    socket?.emit('call:accept', {
      callRoomId: call.callRoomId,
      callerId: call.callerId,
    });
    setCall(null);
    navigate(`/call/${call.callRoomId}?type=${call.callType}`);
  };

  const reject = () => {
    socket?.emit('call:reject', { callerId: call.callerId });
    setCall(null);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center
                    pb-10 px-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-sm rounded-3xl
                   overflow-hidden animate-float-up"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,35,0.97) 0%, rgba(14,14,24,0.98) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 0 60px rgba(99,102,241,0.2), 0 32px 80px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Shimmer top line */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="p-5">
          {/* Call type label */}
          <p className="text-accent-light text-[11px] font-bold uppercase
                        tracking-widest text-center mb-4">
            {call.callType === 'voice' ? '🎙️ Incoming Voice Call' : '📹 Incoming Video Call'}
          </p>

          {/* Caller info */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1c1c2e, #13131f)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  boxShadow: '0 0 30px rgba(99,102,241,0.15)',
                }}
              >
                {call.callerAvatar ? (
                  <img src={call.callerAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {call.callerName?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-[-4px] rounded-[20px] border border-accent/30
                              animate-pulse-soft" />
            </div>
            <div className="text-center">
              <p className="text-txt-primary font-bold text-lg tracking-tight">
                {call.callerName}
              </p>
              <p className="text-txt-muted text-xs mt-0.5">
                {call.callType === 'voice' ? 'Voice' : 'Video'} call
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {/* Reject */}
            <button
              onClick={reject}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl
                         transition-all duration-150 active:scale-95"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284
                       6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493
                       -1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516
                       -5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0
                       008.279 3H5z" />
                </svg>
              </div>
              <span className="text-red-400 text-xs font-semibold">Decline</span>
            </button>

            {/* Accept */}
            <button
              onClick={accept}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl
                         transition-all duration-150 active:scale-95"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                {call.callType === 'voice' ? (
                  <svg className="w-5 h-5 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0
                         01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13
                         -2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2
                         2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894
                         L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2
                         2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="text-green-400 text-xs font-semibold">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
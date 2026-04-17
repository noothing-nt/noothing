import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const TIMER_SECONDS = 5;

export default function ViewOnceImage({ message, isMine, socket }) {
  const [state, setState] = useState('locked'); // locked | viewing | destroyed
  const [countdown, setCountdown] = useState(TIMER_SECONDS);
  const intervalRef = useRef(null);

  const startTimer = () => {
    setState('viewing');
    let remaining = TIMER_SECONDS;
    setCountdown(remaining);

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        destroyMessage();
      }
    }, 1000);
  };

  const destroyMessage = async () => {
    setState('destroyed');
    try {
      // Notify sender via socket
      if (socket) {
        socket.emit('message:viewOnceDestroy', {
          messageId: message._id,
          senderId: message.sender?._id,
        });
      }
      // Also call REST endpoint as safety net
      await api.delete(`/messages/view-once/${message._id}`);
    } catch (err) {
      console.error('View-once destroy error:', err);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  if (state === 'destroyed') {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-2
                      min-w-[180px] min-h-[120px]">
        <span className="text-2xl">🔥</span>
        <p className="text-txt-muted text-xs text-center">Photo destroyed</p>
      </div>
    );
  }

  if (isMine) {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-2
                      min-w-[180px] min-h-[120px]">
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20
                        flex items-center justify-center">
          <span className="text-xl">👁️</span>
        </div>
        <p className="text-txt-secondary text-xs font-medium">View Once Photo</p>
        <p className="text-txt-muted text-[11px] text-center">
          Recipient can view once
        </p>
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <button
        onClick={startTimer}
        className="flex flex-col items-center justify-center p-8 gap-3
                   min-w-[200px] min-h-[140px] w-full
                   hover:bg-surface transition-colors group"
      >
        <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30
                        flex items-center justify-center
                        group-hover:bg-accent/20 transition-colors">
          <svg className="w-7 h-7 text-accent" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268
                 -2.943-9.542-7z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-txt-primary text-sm font-semibold">View Photo</p>
          <p className="text-txt-muted text-xs mt-0.5">
            Disappears after {TIMER_SECONDS}s
          </p>
        </div>
      </button>
    );
  }

  // Viewing state
  return (
    <div className="relative">
      <img
        src={message.image.url}
        alt="View once"
        className="max-w-full max-h-72 object-cover block"
      />
      {/* Countdown overlay */}
      <div className="absolute top-2 right-2 w-10 h-10 rounded-full
                      bg-black/70 backdrop-blur-sm border border-white/20
                      flex items-center justify-center">
        <span className={`text-white font-bold text-sm
                         ${countdown <= 2 ? 'text-red-400' : 'text-white'}`}>
          {countdown}
        </span>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
        <div
          className="h-full bg-accent transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / TIMER_SECONDS) * 100}%` }}
        />
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../context/AuthContext';
import config from '../config';

export default function CallPage() {
  const { roomId }           = useParams();
  const [searchParams]       = useSearchParams();
  const { user }             = useAuth();
  const navigate             = useNavigate();
  const containerRef         = useRef(null);
  const zegoRef              = useRef(null);
  const [error, setError]    = useState('');
  const [joining, setJoining] = useState(true);

  const callType = searchParams.get('type') || 'video'; // 'video' | 'voice'

  useEffect(() => {
    if (!user || !roomId || !containerRef.current) return;

    const appID       = config.ZEGO_APP_ID;
    const serverSecret = config.ZEGO_SERVER_SECRET;

    if (!appID || !serverSecret || appID === 0) {
      setError('ZegoCloud credentials not configured.');
      setJoining(false);
      return;
    }

    try {
      // Generate kit token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        user._id,
        user.username
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zp;

      const scenario = callType === 'voice'
        ? {
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showPreJoinView: false,
            turnOnCameraWhenJoining: false,
            showCameraToggleButton: false,
            showAudioVideoSettingsButton: false,
          }
        : {
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showPreJoinView: false,
            turnOnCameraWhenJoining: true,
            turnOnMicrophoneWhenJoining: true,
          };

      zp.joinRoom({
        container: containerRef.current,
        ...scenario,

        // ── OLED Dark Theme ──────────────────────────
        layout: 'Auto',
        showRoomDetailsButton: false,
        showInviteToCohostButton: false,
        showRemoveUserButton: false,

        // Custom dark UI via container styling
        onJoinRoom: () => setJoining(false),

        onLeaveRoom: () => {
          navigate(-1);
        },

        onUserLeave: () => {
          setTimeout(() => navigate(-1), 1500);
        },

        onCallEnd: (room, reason) => {
          navigate(-1);
        },
      });
    } catch (err) {
      console.error('ZegoCloud init error:', err);
      setError('Failed to initialize call. Check credentials.');
      setJoining(false);
    }

    return () => {
      zegoRef.current?.destroy?.();
    };
  }, [user, roomId, callType, navigate]);

  // ── Error state ────────────────────────────────────
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[100dvh] gap-6"
        style={{ background: '#080808' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <svg className="w-8 h-8 text-red-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-txt-primary font-semibold text-lg">Call Failed</p>
          <p className="text-txt-muted text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Loading overlay */}
      {joining && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center
                     justify-center gap-6"
          style={{ background: '#080808' }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #13131f)',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 40px rgba(99,102,241,0.2)',
            }}
          >
            <span className="text-3xl">
              {callType === 'voice' ? '🎙️' : '📹'}
            </span>
          </div>
          <div className="text-center space-y-2">
            <p className="text-txt-primary font-semibold text-lg">
              {callType === 'voice' ? 'Starting Voice Call' : 'Starting Video Call'}
            </p>
            <p className="text-txt-muted text-sm">Connecting securely...</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="typing-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ZegoCloud container — styled with CSS overrides */}
      <div
        ref={containerRef}
        className="w-full h-full"
        id="zego-container"
      />

      {/* Inject OLED theme overrides */}
      <style>{`
        #zego-container > div {
          background: #080808 !important;
        }
        .zego-room-bottom-bar {
          background: rgba(14,14,14,0.9) !important;
          backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(255,255,255,0.06) !important;
        }
        .zego-room-top-bar {
          background: rgba(14,14,14,0.85) !important;
          backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
        .zego-room-main-area {
          background: #080808 !important;
        }
        .zego-video-player-container {
          background: #111111 !important;
          border-radius: 16px !important;
          overflow: hidden !important;
        }
        .zego-button {
          background: rgba(30,30,40,0.8) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          transition: all 0.2s !important;
        }
        .zego-button:hover {
          background: rgba(99,102,241,0.15) !important;
          border-color: rgba(99,102,241,0.3) !important;
        }
        .zego-button-end-call {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border: none !important;
          box-shadow: 0 4px 20px rgba(239,68,68,0.4) !important;
        }
        .zego-avatar {
          background: linear-gradient(135deg, #1c1c2e, #13131f) !important;
          border: 1px solid rgba(99,102,241,0.2) !important;
        }
        .zego-user-name {
          color: #f0f0f0 !important;
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </div>
  );
}
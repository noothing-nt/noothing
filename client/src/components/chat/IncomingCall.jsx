import { useSocketStore } from '../../store/useSocketStore';
import { useChatStore }   from '../../store/useChatStore';
import Avatar from '../ui/Avatar';

export default function IncomingCall({ callData }) {
  const { emit }     = useSocketStore();
  const { clearCall, setCallAccepted } = useChatStore();

  const accept = () => {
    emit('call:accepted', { callerId: callData.callerId, roomId: callData.roomId });
    setCallAccepted({ roomId: callData.roomId, callType: callData.callType });
    window.open(
      `/call?roomId=${callData.roomId}&type=${callData.callType}`,
      '_blank'
    );
  };

  const reject = () => {
    emit('call:rejected', { callerId: callData.callerId, callType: callData.callType });
    clearCall();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Blur backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:     'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Card */}
      <div
        className="relative flex flex-col items-center text-center
                   px-8 py-8 rounded-3xl animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, rgba(22,22,35,0.98) 0%, rgba(12,12,20,0.99) 100%)',
          border:     '1px solid rgba(255,255,255,0.08)',
          boxShadow:  '0 40px 100px rgba(0,0,0,0.8)',
          minWidth:   '280px',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderRadius: '24px 24px 0 0',
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
        }} />

        {/* Avatar with pulse */}
        <div className="relative mb-4">
          <div
            className="absolute rounded-full animate-ping"
            style={{
              inset:      '-8px',
              background: 'rgba(99,102,241,0.15)',
              animationDuration: '1.5s',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              inset:      '-4px',
              background: 'rgba(99,102,241,0.1)',
              border:     '1px solid rgba(99,102,241,0.2)',
            }}
          />
          <Avatar
            src={callData.callerAvatar}
            username={callData.callerName}
            size={72}
          />
        </div>

        <p className="text-[12px] font-medium mb-1" style={{ color: '#606070' }}>
          Incoming {callData.callType === 'video' ? '📹 Video' : '📞 Voice'} Call
        </p>
        <p
          className="text-[22px] font-bold mb-1 tracking-[-0.02em]"
          style={{ color: '#f0f0f0' }}
        >
          @{callData.callerName}
        </p>
        <p className="text-[11px] mb-7 animate-pulse" style={{ color: '#505060' }}>
          Calling you...
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={reject}
              className="w-16 h-16 rounded-full flex items-center justify-center
                         transition-all active:scale-90 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                boxShadow:  '0 8px 24px rgba(220,38,38,0.4)',
              }}
            >
              <svg className="w-7 h-7" style={{ color: '#ffffff' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
            <span className="text-[11px]" style={{ color: '#606070' }}>Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={accept}
              className="w-16 h-16 rounded-full flex items-center justify-center
                         transition-all active:scale-90 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow:  '0 8px 24px rgba(22,163,74,0.4)',
              }}
            >
              {callData.callType === 'video' ? (
                <svg className="w-7 h-7" style={{ color: '#ffffff' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
              ) : (
                <svg className="w-7 h-7" style={{ color: '#ffffff' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )}
            </button>
            <span className="text-[11px]" style={{ color: '#606070' }}>Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function CreateRoomModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [isBurner, setIsBurner] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchQ.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(searchQ)}`);
        setSearchResults(data);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const toggleMember = (member) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m._id === member._id)
        ? prev.filter((m) => m._id !== member._id)
        : [...prev, member]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return setError('Room name is required.');
    if (selectedMembers.length === 0)
      return setError('Add at least one member.');

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/rooms', {
        name: name.trim(),
        memberIds: selectedMembers.map((m) => m._id),
        isBurner,
      });
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl w-full max-w-md shadow-2xl
                        animate-slide-up flex flex-col max-h-[85dvh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4
                          border-b border-border flex-shrink-0">
            <h2 className="text-txt-primary font-semibold text-base">
              New Group Room
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-txt-muted hover:text-txt-primary
                         hover:bg-surface rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400
                              text-sm px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            {/* Room Name */}
            <div>
              <label className="block text-xs font-medium text-txt-secondary mb-1.5">
                Room Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekend Squad"
                maxLength={50}
                className="w-full bg-void-2 border border-border rounded-xl
                           px-4 py-3 text-txt-primary placeholder-txt-muted text-sm
                           focus:outline-none focus:border-accent/60 focus:ring-1
                           focus:ring-accent/20 transition-all duration-200"
              />
            </div>

            {/* Burner Toggle */}
            <label className="flex items-center justify-between p-4 bg-surface
                               border border-border rounded-xl cursor-pointer group
                               hover:border-orange-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                 transition-colors
                                 ${isBurner
                                   ? 'bg-orange-500/20 border border-orange-500/30'
                                   : 'bg-surface-2 border border-border'
                                 }`}>
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="text-txt-primary text-sm font-medium">Burner Room</p>
                  <p className="text-txt-muted text-xs mt-0.5">
                    Auto-deletes in 24 hours
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isBurner}
                  onChange={(e) => setIsBurner(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200
                               ${isBurner ? 'bg-orange-500' : 'bg-surface-2 border border-border'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                                   shadow transition-transform duration-200
                                   ${isBurner ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </label>

            {/* Member Search */}
            <div>
              <label className="block text-xs font-medium text-txt-secondary mb-1.5">
                Add Members
              </label>
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-void-2 border border-border rounded-xl
                           px-4 py-3 text-txt-primary placeholder-txt-muted text-sm
                           focus:outline-none focus:border-accent/60 focus:ring-1
                           focus:ring-accent/20 transition-all duration-200"
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-void-2 border border-border rounded-xl
                                overflow-hidden divide-y divide-border">
                  {searchResults.map((member) => {
                    const isSelected = !!selectedMembers.find((m) => m._id === member._id);
                    return (
                      <button
                        key={member._id}
                        onClick={() => toggleMember(member)}
                        className={`w-full flex items-center gap-3 px-4 py-3
                                    transition-colors
                                    ${isSelected
                                      ? 'bg-accent/10'
                                      : 'hover:bg-surface'
                                    }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden
                                        bg-surface-2 border border-border
                                        flex items-center justify-center flex-shrink-0">
                          {member.avatar?.url ? (
                            <img src={member.avatar.url} alt=""
                              className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-txt-secondary">
                              {member.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-txt-primary text-sm flex-1 text-left">
                          {member.username}
                        </span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-accent flex-shrink-0"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div>
                <p className="text-txt-muted text-xs mb-2">
                  {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-1.5 bg-accent/10 border
                                 border-accent/20 rounded-full pl-3 pr-2 py-1.5"
                    >
                      <span className="text-accent text-xs font-medium">
                        {member.username}
                      </span>
                      <button
                        onClick={() => toggleMember(member)}
                        className="text-accent/60 hover:text-accent transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-border flex-shrink-0">
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim() || selectedMembers.length === 0}
              className="w-full bg-accent hover:bg-accent-dim text-white font-semibold
                         py-3 rounded-xl transition-all duration-200 text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                `Create ${isBurner ? '🔥 Burner' : ''} Room`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
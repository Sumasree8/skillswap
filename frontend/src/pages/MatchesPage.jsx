import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { swipesApi } from '../services/api';
import { Spinner, EmptyState, Avatar, SkillTag, Modal } from '../components/ui';
import { ChatUI } from '../components/chat/ChatUI';

export default function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);   // { user, chatRoom }

  useEffect(() => {
    swipesApi.getMatches()
      .then(({ data }) => setMatches(data.matches))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-1">Matches</h1>
        <p className="text-sm text-ink-4 mt-0.5">
          {loading ? 'Loading…' : `${matches.length} mutual ${matches.length === 1 ? 'match' : 'matches'} — say hello and set up a swap`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon="♥"
          title="No matches yet"
          description="Head to Discover and swipe right on people you'd like to swap skills with."
          action={<button className="btn-primary" onClick={() => navigate('/discover')}>Start swiping</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(({ user, chatRoom }) => (
            <div key={user._id} className="card p-5">
              <div
                className="flex items-center gap-3 mb-3 cursor-pointer"
                onClick={() => navigate(`/users/${user._id}`)}
              >
                <Avatar user={user} size="lg" />
                <div>
                  <h3 className="font-semibold text-ink-1 hover:text-accent-light transition-colors">{user.name}</h3>
                  {user.location && <p className="text-xs text-ink-5">{user.location}</p>}
                </div>
              </div>
              {user.skillsOffered?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsOffered.slice(0, 3).map((s) => (
                    <SkillTag key={s.name} name={s.name} verified={s.verified} small />
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button className="btn-primary flex-1 text-xs py-2" onClick={() => setChat({ user, chatRoom })}>
                  💬 Message
                </button>
                <button className="btn-secondary text-xs py-2 px-3" onClick={() => navigate(`/users/${user._id}`)}>
                  Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat with a match */}
      <Modal open={!!chat} onClose={() => setChat(null)} title={chat ? `Chat with ${chat.user.name}` : ''}>
        {chat && (
          <div className="h-[60vh] -mx-2">
            <ChatUI room={chat.chatRoom} otherUser={chat.user} />
          </div>
        )}
      </Modal>
    </div>
  );
}

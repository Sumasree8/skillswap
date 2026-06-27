import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { swipesApi } from '../services/api';
import { getSocket } from '../services/socket';
import { SwipeDeck } from '../components/swipe/SwipeDeck';
import { Spinner, EmptyState, Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function DiscoverPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [match, setMatch] = useState(null);   // { user, chatRoom }

  const loadFeed = useCallback(() => {
    setLoading(true);
    setDone(false);
    swipesApi.getFeed()
      .then(({ data }) => setFeed(data.feed))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // Clear swipe history (keeping matches) so the deck fills up again.
  const startOver = useCallback(async () => {
    setLoading(true);
    try { await swipesApi.reset(); } catch { /* fall through to reload */ }
    loadFeed();
  }, [loadFeed]);

  // Someone you'd already liked swipes you back → live match popup.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMatch = ({ user: u, chatRoom }) => setMatch({ user: u, chatRoom });
    socket.on('swipe:match', onMatch);
    return () => socket.off('swipe:match', onMatch);
  }, []);

  const hasSkills = user?.skillsOffered?.length > 0 || user?.skillsWanted?.length > 0;

  return (
    <div className="page-container">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-ink-1">Discover</h1>
        <p className="text-sm text-ink-4 mt-0.5">
          Swipe right to connect, left to pass
        </p>
      </div>

      {!hasSkills && !loading && (
        <div className="max-w-sm mx-auto bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6 text-sm text-ink-3 text-center">
          Add skills to your profile for better matches.{' '}
          <a href="/profile" className="text-accent-light hover:underline">Update profile →</a>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : feed.length === 0 || done ? (
        <EmptyState
          icon="✦"
          title="You're all caught up"
          description="You've seen everyone for now. Check your matches or come back later."
          action={
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={startOver}>Start over</button>
              <button className="btn-primary" onClick={() => navigate('/matches')}>View Matches</button>
            </div>
          }
        />
      ) : (
        <SwipeDeck
          feed={feed}
          onMatch={(u, chatRoom) => setMatch({ user: u, chatRoom })}
          onEmpty={() => setDone(true)}
        />
      )}

      {/* It's a match! */}
      {match && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMatch(null)} />
          <div className="relative card p-8 max-w-sm w-full text-center animate-slide-up">
            <p className="text-2xl font-extrabold text-accent-light mb-1">It's a match!</p>
            <p className="text-sm text-ink-4 mb-6">
              You and {match.user.name} both want to swap.
            </p>
            <div className="flex items-center justify-center gap-4 mb-7">
              <Avatar user={user} size="xl" className="!w-20 !h-20 ring-2 ring-accent" />
              <span className="text-3xl text-accent">♥</span>
              <Avatar user={match.user} size="xl" className="!w-20 !h-20 ring-2 ring-accent" />
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setMatch(null)}>
                Keep swiping
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => navigate('/matches')}
              >
                💬 Send a message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

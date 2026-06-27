import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Heart } from 'lucide-react';
import { SwipeCard } from './SwipeCard';
import { swipesApi } from '../../services/api';
import { toast } from '../ui';

const THRESHOLD = 110;   // px past which a release counts as a decision

/**
 * Card stack with drag-to-swipe. Left = pass, right = like.
 * Calls onMatch(user, chatRoom) when a like is mutual.
 */
export const SwipeDeck = ({ feed, onMatch, onEmpty }) => {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(null);   // 'like' | 'pass' while flying out
  const start = useRef(null);
  const busy = useRef(false);

  const current = feed[index];
  const next = feed[index + 1];

  // Send the decision to the API and advance the deck.
  const commit = useCallback(async (action, user) => {
    try {
      const { data } = await swipesApi.swipe(user._id, action);
      if (data.match) onMatch?.(data.user, data.chatRoom);
    } catch {
      toast.error('Could not record that swipe');
    } finally {
      setIndex((i) => i + 1);
      setDrag({ x: 0, y: 0 });
      setLeaving(null);
      busy.current = false;
    }
  }, [onMatch]);

  // Animate the top card off-screen, then commit.
  const decide = useCallback((action) => {
    if (busy.current || !current) return;
    busy.current = true;
    const user = current.user;
    setLeaving(action);
    setDrag({ x: action === 'like' ? window.innerWidth : -window.innerWidth, y: 0 });
    setTimeout(() => commit(action, user), 280);
  }, [current, commit]);

  // ── Pointer drag ────────────────────────────────────────────────
  const onPointerDown = (e) => {
    if (busy.current) return;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    setDrag((d) => {
      if (d.x > THRESHOLD) { decide('like'); return d; }
      if (d.x < -THRESHOLD) { decide('pass'); return d; }
      return { x: 0, y: 0 };   // snap back
    });
  };

  // ── Keyboard arrows ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') decide('pass');
      if (e.key === 'ArrowRight') decide('like');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide]);

  useEffect(() => {
    if (feed.length && index >= feed.length) onEmpty?.();
  }, [index, feed.length, onEmpty]);

  if (!current) return null;

  const rotation = drag.x * 0.06;
  const likeOpacity = Math.max(0, Math.min(1, drag.x / THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -drag.x / THRESHOLD));
  const transition = start.current ? 'none' : 'transform 0.28s ease';

  return (
    <div className="flex flex-col items-center">
      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[480px]">
        {next && (
          <SwipeCard
            key={next.user._id}
            {...next}
            style={{ transform: 'scale(0.95) translateY(12px)', opacity: 0.7, zIndex: 1 }}
          />
        )}
        <SwipeCard
          key={current.user._id}
          {...current}
          draggable
          onPointerDown={onPointerDown}
          // move/up handlers attach to the same element via props below
          cardRef={(el) => {
            if (el) {
              el.onpointermove = onPointerMove;
              el.onpointerup = onPointerUp;
              el.onpointercancel = onPointerUp;
            }
          }}
          likeOpacity={likeOpacity}
          nopeOpacity={nopeOpacity}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
            transition,
            zIndex: 10,
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-5 mt-6">
        <button
          onClick={() => decide('pass')}
          aria-label="Pass"
          className="w-14 h-14 rounded-full bg-surface-2 border border-surface-4 text-danger flex items-center justify-center hover:bg-danger/10 hover:border-danger/40 active:scale-90 transition-all"
        >
          <X size={26} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => decide('like')}
          aria-label="Like"
          className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-glow hover:bg-accent-dark active:scale-90 transition-all"
        >
          <Heart size={30} fill="currentColor" strokeWidth={2} />
        </button>
      </div>
      <p className="text-xs text-ink-5 mt-4">
        Drag the card, tap the buttons, or use <kbd>←</kbd> / <kbd>→</kbd>
      </p>
    </div>
  );
};

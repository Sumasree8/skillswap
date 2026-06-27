import { Star, Sparkles } from 'lucide-react';
import { Avatar, SkillTag, MatchScoreBadge } from '../ui';
import { getAvgRating } from '../../utils/helpers';

/**
 * Presentational swipe card. All drag math lives in SwipeDeck, which passes
 * `style` (transform) plus the live LIKE / NOPE stamp opacities.
 */
export const SwipeCard = ({
  user,
  matchScore = 0,
  matchedSkills = [],
  style = {},
  likeOpacity = 0,
  nopeOpacity = 0,
  draggable = false,
  onPointerDown,
  cardRef,
}) => {
  const avgRating = getAvgRating(user.rating, user.ratingCount);

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      style={style}
      className={`absolute inset-0 card overflow-hidden select-none ${
        draggable ? 'cursor-grab active:cursor-grabbing touch-none' : ''
      }`}
    >
      {/* LIKE / NOPE stamps */}
      <div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 rotate-[-18deg] border-4 border-success text-success font-extrabold text-3xl px-3 py-1 rounded-xl tracking-wider pointer-events-none"
      >
        LIKE
      </div>
      <div
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 right-6 z-20 rotate-[18deg] border-4 border-danger text-danger font-extrabold text-3xl px-3 py-1 rounded-xl tracking-wider pointer-events-none"
      >
        NOPE
      </div>

      {/* Top: avatar banner */}
      <div className="relative h-44 bg-gradient-to-br from-accent/30 via-accent/10 to-surface-2 flex items-center justify-center">
        <Avatar user={user} size="xl" className="!w-24 !h-24 ring-4 ring-surface-1 shadow-glow" />
        {matchScore > 0 && (
          <div className="absolute top-4 right-4 bg-surface-0/70 backdrop-blur rounded-xl px-2.5 py-1.5">
            <MatchScoreBadge score={matchScore} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-ink-1">{user.name}</h3>
          {avgRating && (
            <span className="flex items-center gap-1 text-xs text-credit">
              <Star size={12} fill="currentColor" strokeWidth={0} /> {avgRating}
            </span>
          )}
          {user.location && <span className="text-xs text-ink-5">· {user.location}</span>}
        </div>

        {user.bio && (
          <p className="text-sm text-ink-4 mt-2 line-clamp-3 leading-relaxed">{user.bio}</p>
        )}

        {user.skillsOffered?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">Can teach</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsOffered.slice(0, 5).map((s) => (
                <SkillTag key={s.name} name={s.name} verified={s.verified} small />
              ))}
            </div>
          </div>
        )}

        {user.skillsWanted?.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">Wants to learn</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsWanted.slice(0, 4).map((s) => (
                <span key={s.name} className="badge bg-surface-3 text-ink-4 border border-surface-4 text-xs">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {matchedSkills?.length > 0 && (
          <p className="mt-4 text-xs text-success/90 flex items-center gap-1.5">
            <Sparkles size={13} className="shrink-0" />
            You both want what the other offers: {matchedSkills.slice(0, 3).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

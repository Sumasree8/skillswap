import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { UserCard } from '../components/swap/UserCard';
import { Spinner, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    usersApi.getMatches()
      .then(({ data }) => setMatches(data.matches))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(matches); return; }
    const q = search.toLowerCase();
    setFiltered(matches.filter(({ user: u }) =>
      u.name.toLowerCase().includes(q) ||
      u.skillsOffered?.some(s => s.name.toLowerCase().includes(q)) ||
      u.skillsWanted?.some(s => s.name.toLowerCase().includes(q))
    ));
  }, [search, matches]);

  const hasSkills = user?.skillsOffered?.length > 0 || user?.skillsWanted?.length > 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-1">Discover</h1>
          <p className="text-sm text-ink-4 mt-0.5">
            {loading ? 'Finding matches…' : `${filtered.length} people to swap with`}
          </p>
        </div>
        <input
          type="text"
          className="input w-full sm:w-64 text-sm"
          placeholder="Search by name or skill…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* No skills warning */}
      {!hasSkills && !loading && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6 text-sm text-ink-3 flex items-center gap-3">
          <span className="text-warning text-lg">◈</span>
          <span>
            Add skills to your profile to see better matches.{' '}
            <a href="/profile" className="text-accent-light hover:underline">Update profile →</a>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⊹"
          title="No matches found"
          description="Try adding more skills to your profile or broaden your search"
          action={<a href="/profile" className="btn-primary">Update Skills</a>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ user: u, matchScore, matchedSkills }) => (
            <UserCard key={u._id} user={u} matchScore={matchScore} matchedSkills={matchedSkills} />
          ))}
        </div>
      )}
    </div>
  );
}

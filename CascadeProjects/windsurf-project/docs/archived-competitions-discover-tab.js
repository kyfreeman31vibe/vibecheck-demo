// ARCHIVED: CompetitionsTab component from Discover.js
// To re-enable: import useCompetitions, add this component, add tab to Discover

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompetitions } from '../hooks/useCompetitions';

function CompetitionsTab({ competitions, loading, onCreate }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim() || !theme.trim()) {
      setError('Title and theme are required.');
      return;
    }
    setCreating(true);
    setError('');
    const { error: createErr } = await onCreate({ title: title.trim(), description: description.trim(), theme: theme.trim() });
    setCreating(false);
    if (createErr) {
      setError(createErr.message || 'Failed to create competition.');
    } else {
      setTitle('');
      setDescription('');
      setTheme('');
      setShowForm(false);
    }
  }

  if (loading) return <p className="caption">Loading competitions...</p>;

  var statusEmoji = { active: '\u{1F7E2}', voting: '\u{1F5F3}\u{FE0F}', ended: '\u{1F3C6}' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="caption">{competitions.length} competition{competitions.length !== 1 ? 's' : ''}</div>
        <button type="button" className="btn small primary" onPointerDown={function () { setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ New Competition'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="section glass" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <input className="input" type="text" placeholder="Competition title" value={title} onChange={function (e) { setTitle(e.target.value); }} />
          <input className="input" type="text" placeholder='Theme (e.g. "Best Summer Playlist")' value={theme} onChange={function (e) { setTheme(e.target.value); }} />
          <input className="input" type="text" placeholder="Description (optional)" value={description} onChange={function (e) { setDescription(e.target.value); }} />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button type="submit" className="btn primary" disabled={creating}>{creating ? 'Creating...' : 'Create Competition'}</button>
        </form>
      )}

      <div className="list">
        {competitions.map(function (comp) {
          var creator = comp.profiles || {};
          return (
            <Link key={comp.id} to={'/app/competition/' + comp.id} className="list-item glass" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="list-title">{comp.title}</div>
                  <div className="caption">{comp.description}</div>
                </div>
                <span style={{ fontSize: 18 }}>{statusEmoji[comp.status] || ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <div className="pill small">{comp.theme}</div>
                <div className="pill small">{comp.entry_count} {comp.entry_count === 1 ? 'entry' : 'entries'}</div>
                {creator.name && <div className="caption">by {creator.name}</div>}
              </div>
            </Link>
          );
        })}
        {competitions.length === 0 && (
          <div className="section glass" style={{ textAlign: 'center', padding: 16 }}>
            <p className="caption">No competitions yet. Start one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// In Discover(), add:
// var { competitions, loading: compLoading, createCompetition } = useCompetitions();
// Add 'competitions' to the tab list
// Add: {tab === 'competitions' && <CompetitionsTab competitions={competitions} loading={compLoading} onCreate={createCompetition} />}

// In App.js, add:
// import { CompetitionDetail } from './pages/CompetitionDetail';
// <Route path="competition/:id" element={<CompetitionDetail />} />

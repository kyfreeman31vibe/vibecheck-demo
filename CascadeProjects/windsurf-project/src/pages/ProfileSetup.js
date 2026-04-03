import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

const AVAILABLE_GENRES = [
  'Alternative', 'Ambient', 'Blues', 'Classical', 'Country', 'Dance',
  'Disco', 'Drum & Bass', 'EDM', 'Electronic', 'Emo', 'Folk',
  'Funk', 'Gospel', 'Grunge', 'Hip-Hop', 'House', 'Indie',
  'Jazz', 'K-Pop', 'Latin', 'Lo-Fi', 'Metal', 'Neo-Soul',
  'Pop', 'Punk', 'R&B', 'Rap', 'Reggae', 'Reggaeton',
  'Rock', 'Ska', 'Soul', 'Techno', 'Trap', 'World',
];

const AVAILABLE_ARTISTS = [
  'Adele', 'Arctic Monkeys', 'Bad Bunny', 'Beyoncé', 'Billie Eilish',
  'Bruno Mars', 'Childish Gambino', 'Daniel Caesar', 'Doja Cat', 'Drake',
  'Dua Lipa', 'Ed Sheeran', 'Frank Ocean', 'Fred again..', 'Giveon',
  'Gorillaz', 'H.E.R.', 'Harry Styles', 'J. Cole', 'Jhené Aiko',
  'Kaytranada', 'Kendrick Lamar', 'Khalid', 'Lana Del Rey', 'Lizzo',
  'Mac Miller', 'Megan Thee Stallion', 'Metro Boomin', 'Miguel', 'Olivia Rodrigo',
  'Phoebe Bridgers', 'Post Malone', 'Radiohead', 'Rihanna', 'Rosalía',
  'SZA', 'Steve Lacy', 'Summer Walker', 'SWV', 'Tame Impala',
  'Taylor Swift', 'The Weeknd', 'Travis Scott', 'Tyler, The Creator', 'Usher',
];

const AVAILABLE_MOODS = ['Happy', 'Chill', 'Energetic', 'Reflective', 'Romantic', 'Social'];

function SearchableDropdown({ label, caption, options, selected, setSelected, maxSelections, placeholder }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  );

  function addItem(item) {
    if (maxSelections && selected.length >= maxSelections) return;
    setSelected([...selected, item]);
    setSearch('');
  }

  function removeItem(item) {
    setSelected(selected.filter((s) => s !== item));
  }

  return (
    <div className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
      <div style={{ flex: 1 }}>
        <div className="steps-title">{label}</div>
        {caption && <div className="steps-caption">{caption}</div>}
        {selected.length > 0 && (
          <div className="tag-row" style={{ marginTop: 6, marginBottom: 6 }}>
            {selected.map((item) => (
              <span key={item} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {item}
                <span
                  style={{ cursor: 'pointer', fontWeight: 'bold', marginLeft: 2 }}
                  onPointerDown={() => removeItem(item)}
                >✕</span>
              </span>
            ))}
          </div>
        )}
        <div ref={ref} style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder={placeholder || 'Search...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && search.trim() && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'var(--surface, #1a1a2e)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, maxHeight: 180, overflowY: 'auto', marginTop: 4,
            }}>
              {filtered.slice(0, 15).map((item) => (
                <div
                  key={item}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}
                  onPointerDown={() => { addItem(item); setOpen(false); }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
          {open && search.trim() && filtered.length === 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'var(--surface, #1a1a2e)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '8px 12px', marginTop: 4,
            }}>
              <span className="caption">No results</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileSetup() {
  const { profile, saveProfile } = useCurrentUserProfile();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [genres, setGenres] = useState(profile?.genres || []);
  const [city, setCity] = useState(profile?.city || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [favoriteArtists, setFavoriteArtists] = useState(profile?.favoriteArtists || []);
  const [moods, setMoods] = useState(profile?.moods || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const toggleMood = (mood) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((m) => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const result = await saveProfile({
      name: name.trim() || 'New User',
      username: username.trim() || 'user',
      genres,
      city,
      bio,
      favoriteArtists,
      moods,
    });

    setSaving(false);
    if (result?.error) {
      setSaveError(result.error.message || 'Failed to save profile.');
      return;
    }
    navigate('/app/dashboard');
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Profile setup</h2>
          <p className="subtitle">Set up your profile so we can connect you with your community.</p>
        </div>
      </header>
      <section className="section glass" style={{ marginBottom: 12 }}>
        <h3>Your Info</h3>
        <form className="steps-list" onSubmit={handleSubmit}>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Name</div>
              <input
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Username</div>
              <input
                className="input"
                placeholder="@handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">City</div>
              <input
                className="input"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Short bio</div>
              <textarea
                className="input"
                placeholder="A few words about your vibe"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </label>

          <SearchableDropdown
            label="Top genres"
            caption="Search and select your favorite genres."
            options={AVAILABLE_GENRES}
            selected={genres}
            setSelected={setGenres}
            maxSelections={10}
            placeholder="Search genres..."
          />

          <SearchableDropdown
            label="Favorite artists"
            caption="Select up to 5 artists you vibe with most."
            options={AVAILABLE_ARTISTS}
            selected={favoriteArtists}
            setSelected={setFavoriteArtists}
            maxSelections={5}
            placeholder="Search artists..."
          />

          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Mood tags</div>
              <div className="steps-caption">Pick a few that best match your usual vibe.</div>
              <div className="tag-row" style={{ marginTop: 8 }}>
                {AVAILABLE_MOODS.map((mood) => {
                  const selected = moods.includes(mood);
                  return (
                    <button
                      key={mood}
                      type="button"
                      className={selected ? 'btn small primary' : 'btn small ghost'}
                      onClick={() => toggleMood(mood)}
                    >
                      {mood}
                    </button>
                  );
                })}
              </div>
            </div>
          </label>
          {saveError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{saveError}</p>}
          <button type="submit" className="btn primary full-width" style={{ marginTop: 12 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>
    </div>
  );
}

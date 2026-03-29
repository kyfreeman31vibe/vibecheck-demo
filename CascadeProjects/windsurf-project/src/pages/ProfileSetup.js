import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

const steps = [
  'Basics',
  'Genres',
  'Top Artists',
  'Top Songs',
  'Photos',
  'Connections',
  'Review',
];

const AVAILABLE_ARTISTS = [
  'Tame Impala',
  'Kaytranada',
  'Phoebe Bridgers',
  'SZA',
  'Kendrick Lamar',
  'Frank Ocean',
  'Billie Eilish',
  'Fred again..',
  'Bad Bunny',
  'Rosalía',
];

const AVAILABLE_MOODS = ['Happy', 'Chill', 'Energetic', 'Reflective', 'Romantic', 'Social'];

export function ProfileSetup() {
  const { profile, saveProfile } = useCurrentUserProfile();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [intent, setIntent] = useState(profile?.intent || 'Friends');
  const [genres, setGenres] = useState(profile?.genres?.join(', ') || '');
  const [city, setCity] = useState(profile?.city || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [artistSearch, setArtistSearch] = useState('');
  const [favoriteArtists, setFavoriteArtists] = useState(profile?.favoriteArtists || []);
  const [moods, setMoods] = useState(profile?.moods || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const filteredArtists = AVAILABLE_ARTISTS.filter((artist) =>
    artist.toLowerCase().includes(artistSearch.toLowerCase())
  );

  const toggleArtist = (artist) => {
    if (favoriteArtists.includes(artist)) {
      setFavoriteArtists(favoriteArtists.filter((a) => a !== artist));
    } else if (favoriteArtists.length < 5) {
      setFavoriteArtists([...favoriteArtists, artist]);
    }
  };

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
      intent,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
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
          <p className="subtitle">Set up your profile so we can find your people.</p>
        </div>
      </header>
      <section className="section glass" style={{ marginBottom: 12 }}>
        <h3>Basics</h3>
        <p className="caption" style={{ marginTop: 4 }}>Step 1 of 7 · Complete the basics to get started.</p>
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
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Connection intent</div>
              <select
                className="input"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              >
                <option value="Friends">Friends</option>
                <option value="Dating">Dating</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Top genres</div>
              <input
                className="input"
                placeholder="e.g. Indie, Lo-fi, Alt R&B"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              />
              <div className="steps-caption">Comma-separated; used to personalize your demo profile.</div>
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Favorite artists</div>
              <input
                className="input"
                placeholder="Search artists"
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
              />
              <div className="steps-caption">Select up to 5 artists you vibe with most.</div>
              <div className="tag-row" style={{ marginTop: 8 }}>
                {filteredArtists.map((artist) => {
                  const selected = favoriteArtists.includes(artist);
                  return (
                    <button
                      key={artist}
                      type="button"
                      className={selected ? 'btn small primary' : 'btn small ghost'}
                      onClick={() => toggleArtist(artist)}
                    >
                      {artist}
                    </button>
                  );
                })}
              </div>
            </div>
          </label>
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
      <ol className="steps-list">
        {steps.map((step, idx) => (
          <li key={step} className="steps-item glass">
            <div className="steps-index">{idx + 1}</div>
            <div>
              <div className="steps-title">{step}</div>
              <div className="steps-caption">Coming soon.</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

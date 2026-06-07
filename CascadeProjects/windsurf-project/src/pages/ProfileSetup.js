import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { AVAILABLE_GENRES, AVAILABLE_ARTISTS, AVAILABLE_MOODS, AVAILABLE_CONTEXTS, AVAILABLE_DISCOVERY, AVAILABLE_DECADES, CONCERT_FREQUENCY_OPTIONS } from '../data/profileOptions';

const TOTAL_STEPS = 4;

function ProgressBar({ step, total }) {
  var pct = Math.round((step / total) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="caption">Step {step} of {total}</span>
        <span className="caption">{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.08)' }}>
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--vc-whiskey-amber), var(--vc-velvet-purple))',
            width: pct + '%',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

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
    <div style={{ marginBottom: 16 }}>
      <div className="steps-title" style={{ marginBottom: 8 }}>{label}</div>
      {caption && <div className="steps-caption" style={{ marginBottom: 8 }}>{caption}</div>}
      {selected.length > 0 && (
        <div className="tag-row" style={{ marginTop: 8, marginBottom: 8 }}>
          {selected.map((item) => (
            <span key={item} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {item}
              <span
                style={{ cursor: 'pointer', fontWeight: 'bold', marginLeft: 4, opacity: 0.6, fontSize: '0.75rem', lineHeight: 1 }}
                onClick={(e) => { e.stopPropagation(); removeItem(item); }}
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
            background: 'linear-gradient(135deg, rgba(50, 30, 80, 0.95), rgba(38, 49, 74, 0.98))',
            border: '1px solid rgba(232, 228, 222, 0.12)',
            borderRadius: 12, maxHeight: 180, overflowY: 'auto', marginTop: 8,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          }}>
            {filtered.slice(0, 15).map((item) => (
              <div
                key={item}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.15s ease' }}
                onClick={(e) => { e.stopPropagation(); addItem(item); setOpen(false); }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item}
              </div>
            ))}
          </div>
        )}
        {open && search.trim() && filtered.length === 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'linear-gradient(135deg, rgba(50, 30, 80, 0.95), rgba(38, 49, 74, 0.98))',
            border: '1px solid rgba(232, 228, 222, 0.12)',
            borderRadius: 12, padding: '8px 16px', marginTop: 8,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          }}>
            <span className="caption">No results</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StepBasics({ name, setName, username, setUsername, city, setCity }) {
  return (
    <>
      <h3 style={{ marginBottom: 8 }}>Who are you?</h3>
      <p className="caption" style={{ marginBottom: 16 }}>Let people know who they're vibing with.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="steps-title" style={{ marginBottom: 8 }}>Name</div>
          <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <div className="steps-title" style={{ marginBottom: 8 }}>Username</div>
          <input className="input" placeholder="@handle" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <div className="steps-title" style={{ marginBottom: 8 }}>City</div>
          <input className="input" placeholder="Your city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
    </>
  );
}

function StepMusic({ genres, setGenres, favoriteArtists, setFavoriteArtists }) {
  return (
    <>
      <h3 style={{ marginBottom: 8 }}>Your music taste</h3>
      <p className="caption" style={{ marginBottom: 16 }}>This is how we match you with your people.</p>
      <SearchableDropdown
        label="Top genres"
        caption="Pick up to 5 genres you love."
        options={AVAILABLE_GENRES}
        selected={genres}
        setSelected={setGenres}
        maxSelections={5}
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
    </>
  );
}

function StepHabits({ listeningContexts, toggleContext, musicDiscovery, toggleDiscovery, favoriteDecades, toggleDecade, concertFrequency, setConcertFrequency }) {
  return (
    <>
      <h3 style={{ marginBottom: 8 }}>Listening habits</h3>
      <p className="caption" style={{ marginBottom: 16 }}>Help us understand how you listen so we can find your best matches.</p>

      <div style={{ marginBottom: 16 }}>
        <div className="steps-title" style={{ marginBottom: 8 }}>When do you listen?</div>
        <div className="steps-caption" style={{ marginBottom: 8 }}>Select all that apply.</div>
        <div className="tag-row">
          {AVAILABLE_CONTEXTS.map((ctx) => {
            var sel = listeningContexts.includes(ctx);
            return (
              <button key={ctx} type="button" className={sel ? 'btn small primary' : 'btn small ghost'} onClick={() => toggleContext(ctx)}>
                {ctx}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="steps-title" style={{ marginBottom: 8 }}>How do you discover music?</div>
        <div className="tag-row">
          {AVAILABLE_DISCOVERY.map((d) => {
            var sel = musicDiscovery.includes(d);
            return (
              <button key={d} type="button" className={sel ? 'btn small primary' : 'btn small ghost'} onClick={() => toggleDiscovery(d)}>
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="steps-title" style={{ marginBottom: 8 }}>Favorite decades</div>
        <div className="tag-row">
          {AVAILABLE_DECADES.map((dec) => {
            var sel = favoriteDecades.includes(dec);
            return (
              <button key={dec} type="button" className={sel ? 'btn small primary' : 'btn small ghost'} onClick={() => toggleDecade(dec)}>
                {dec}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="steps-title" style={{ marginBottom: 8 }}>How often do you see live music?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CONCERT_FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={concertFrequency === opt.value ? 'btn small primary' : 'btn small ghost'}
              onClick={() => setConcertFrequency(opt.value)}
              style={{ textAlign: 'left' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StepVibe({ bio, setBio, moods, toggleMood }) {
  return (
    <>
      <h3 style={{ marginBottom: 8 }}>Your vibe</h3>
      <p className="caption" style={{ marginBottom: 16 }}>Tell us a little more about how you listen.</p>
      <div style={{ marginBottom: 16 }}>
        <div className="steps-title" style={{ marginBottom: 8 }}>Short bio</div>
        <textarea
          className="input"
          placeholder="A few words about your vibe"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div>
        <div className="steps-title" style={{ marginBottom: 8 }}>Listening titles</div>
        <div className="steps-caption" style={{ marginBottom: 8 }}>Pick up to 3 that describe you.</div>
        <div className="tag-row">
          {AVAILABLE_MOODS.map((mood) => {
            var sel = moods.includes(mood);
            return (
              <button
                key={mood}
                type="button"
                className={sel ? 'btn small primary' : 'btn small ghost'}
                onClick={() => toggleMood(mood)}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function ProfileSetup() {
  const { profile, saveProfile } = useCurrentUserProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [genres, setGenres] = useState([]);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [moods, setMoods] = useState([]);
  const [listeningContexts, setListeningContexts] = useState([]);
  const [musicDiscovery, setMusicDiscovery] = useState([]);
  const [favoriteDecades, setFavoriteDecades] = useState([]);
  const [concertFrequency, setConcertFrequency] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [synced, setSynced] = useState(null);

  useEffect(() => {
    if (profile?.id && profile.id !== synced) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setGenres(profile.genres || []);
      setCity(profile.city || '');
      setBio(profile.bio || '');
      setFavoriteArtists(profile.favoriteArtists || []);
      setMoods(profile.moods || []);
      setListeningContexts(profile.listeningContexts || []);
      setMusicDiscovery(profile.musicDiscovery || []);
      setFavoriteDecades(profile.favoriteDecades || []);
      setConcertFrequency(profile.concertFrequency || '');
      setSynced(profile.id);
    }
  }, [profile, synced]);

  const toggleMood = (mood) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((m) => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const [saved, setSaved] = useState(false);

  const toggleContext = (ctx) => {
    setListeningContexts((prev) => prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]);
  };
  const toggleDiscovery = (d) => {
    setMusicDiscovery((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };
  const toggleDecade = (dec) => {
    setFavoriteDecades((prev) => prev.includes(dec) ? prev.filter((x) => x !== dec) : [...prev, dec]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    const result = await saveProfile({
      name: name.trim(),
      username: username.trim() || 'user',
      genres,
      city,
      bio,
      favoriteArtists,
      moods,
      listeningContexts,
      musicDiscovery,
      favoriteDecades,
      concertFrequency,
    });

    setSaving(false);
    if (result?.error) {
      setSaveError(result.error.message || 'Failed to save profile.');
      return;
    }
    setSaved(true);
    setTimeout(() => navigate('/app/dashboard'), 1000);
  };

  var canAdvance = true;
  if (step === 1 && (!name.trim() || !username.trim())) canAdvance = false;

  var stepTitles = ['Your Info', 'Music Taste', 'Your Vibe', 'Listening Habits'];

  return (
    <div className="page">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
        <div className="logo-wordmark" style={{ fontSize: '1rem', marginBottom: 8 }}>VibeCheck</div>
        <h2>Profile setup</h2>
        <p className="subtitle">{stepTitles[step - 1]}</p>
      </header>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      <section className="section glass-elevated" style={{ marginBottom: 16 }}>
        {step === 1 && (
          <StepBasics name={name} setName={setName} username={username} setUsername={setUsername} city={city} setCity={setCity} />
        )}
        {step === 2 && (
          <StepMusic genres={genres} setGenres={setGenres} favoriteArtists={favoriteArtists} setFavoriteArtists={setFavoriteArtists} />
        )}
        {step === 3 && (
          <StepVibe bio={bio} setBio={setBio} moods={moods} toggleMood={toggleMood} />
        )}
        {step === 4 && (
          <StepHabits
            listeningContexts={listeningContexts} toggleContext={toggleContext}
            musicDiscovery={musicDiscovery} toggleDiscovery={toggleDiscovery}
            favoriteDecades={favoriteDecades} toggleDecade={toggleDecade}
            concertFrequency={concertFrequency} setConcertFrequency={setConcertFrequency}
          />
        )}

        {saveError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: '8px 0 0' }}>{saveError}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          {step > 1 && (
            <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="btn primary"
              style={{ flex: 1 }}
              disabled={!canAdvance}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              style={{ flex: 1 }}
              disabled={saving || saved}
              onClick={handleSave}
            >
              {saved ? <span className="btn-success-icon">✓ Saved!</span> : saving ? <span className="btn-spinner" /> : 'Finish setup'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { TOP_500_ARTISTS } from '../constants/artists';

// --- Questions Data ---
var QUESTIONS = [
  {
    title: 'How do you experience music?',
    key: 'listeningStyle',
    options: [
      "It's the soundtrack to everything — always on",
      'I go deep on albums I love and replay them obsessively',
      'I discover constantly — always finding something new',
      'I listen in focused sessions — it has my full attention',
    ],
  },
  {
    title: 'Pick the sound that lives in your chest.',
    key: 'soundWorld',
    options: [
      'Late night, slow, atmospheric — music that feels like 2am',
      'High energy — I want to feel it physically',
      'Soulful and grounded — roots, warmth, emotion',
      "Eclectic and unpredictable — I don't fit in one box",
    ],
  },
  {
    title: 'Where does your music come from?',
    key: 'discoverySource',
    options: [
      'From people I trust — friends, curators, tastemakers',
      'I dig — Bandcamp, underground blogs, YouTube rabbit holes',
      'Playlists and algorithms point me somewhere, I follow the thread',
      'Live music and local scenes are how I find everything',
    ],
  },
  {
    title: 'What does music do for you?',
    key: 'musicRole',
    options: [
      'It helps me process — I feel things through it',
      'It moves me — literally, I need it to function',
      'It connects me to culture, history, and identity',
      "It's pure joy — it just makes me feel alive",
    ],
  },
  {
    title: 'What does a good music night look like?',
    key: 'liveMusicVibe',
    options: [
      'Intimate venue, small crowd, I can feel the room',
      'Big energy — festivals, crowds, the full experience',
      "A great playlist at home or a friend's place",
      'Open mics and local artists, discovering someone early',
    ],
  },
];

var TOTAL_STEPS = 6;
var MIN_ARTISTS = 3;
var MAX_ARTISTS = 10;

// --- Progress Bar ---
function ProgressBar({ step }) {
  var pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="caption">Step {step} of {TOTAL_STEPS}</span>
        <span className="caption">{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.08)' }}>
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--vc-whiskey-amber), var(--vc-velvet-purple))',
            width: pct + '%',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

// --- Single Select Step ---
function QuestionStep({ question, selected, onSelect }) {
  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: '1.25rem', lineHeight: 1.4 }}>{question.title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {question.options.map(function (option) {
          var isSelected = selected === option;
          return (
            <div
              key={option}
              role="button"
              tabIndex={0}
              onClick={function () { onSelect(option); }}
              onKeyDown={function (e) { if (e.key === 'Enter' || e.key === ' ') onSelect(option); }}
              className="glass"
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                cursor: 'pointer',
                border: isSelected
                  ? '2px solid var(--vc-whiskey-amber)'
                  : '2px solid transparent',
                background: isSelected
                  ? 'rgba(227, 126, 47, 0.12)'
                  : 'rgba(255, 255, 255, 0.04)',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Artist Selection Step ---
function ArtistStep({ selected, onToggle }) {
  var searchRef = useState('');
  var search = searchRef[0];
  var setSearch = searchRef[1];

  var filtered = useMemo(function () {
    if (!search.trim()) return TOP_500_ARTISTS;
    var q = search.toLowerCase();
    return TOP_500_ARTISTS.filter(function (a) {
      return a.toLowerCase().includes(q);
    });
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ marginBottom: 16, fontSize: '1.25rem' }}>Pick your artists.</h2>

      <input
        className="input"
        placeholder="Search artists..."
        value={search}
        onChange={function (e) { setSearch(e.target.value); }}
        style={{ marginBottom: 8 }}
      />

      <div className="caption" style={{ marginBottom: 12 }}>
        {selected.length} of {MAX_ARTISTS} selected
        {selected.length < MIN_ARTISTS && (
          <span style={{ marginLeft: 8, opacity: 0.7 }}>
            (pick at least {MIN_ARTISTS})
          </span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignContent: 'flex-start',
          paddingBottom: 16,
          maxHeight: 'calc(100vh - 320px)',
        }}
      >
        {filtered.map(function (artist) {
          var isSelected = selected.includes(artist);
          var atMax = selected.length >= MAX_ARTISTS && !isSelected;
          return (
            <div
              key={artist}
              role="button"
              tabIndex={0}
              onClick={function () { if (!atMax) onToggle(artist); }}
              onKeyDown={function (e) { if ((e.key === 'Enter' || e.key === ' ') && !atMax) onToggle(artist); }}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: '0.8rem',
                cursor: atMax ? 'not-allowed' : 'pointer',
                opacity: atMax ? 0.4 : 1,
                border: isSelected
                  ? '1.5px solid var(--vc-whiskey-amber)'
                  : '1.5px solid rgba(255,255,255,0.12)',
                background: isSelected
                  ? 'rgba(227, 126, 47, 0.18)'
                  : 'rgba(255,255,255,0.04)',
                color: isSelected
                  ? 'var(--vc-whiskey-amber)'
                  : 'inherit',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {artist}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="caption" style={{ padding: 16, width: '100%', textAlign: 'center' }}>
            No artists match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Onboarding Component ---
export function OnboardingQuestionnaire() {
  var navigate = useNavigate();
  var { user } = useAuth();
  var stepRef = useState(1);
  var step = stepRef[0];
  var setStep = stepRef[1];
  var savingRef = useState(false);
  var saving = savingRef[0];
  var setSaving = savingRef[1];
  var directionRef = useState('forward');
  var direction = directionRef[0];
  var setDirection = directionRef[1];

  // Answers state
  var answersRef = useState({});
  var answers = answersRef[0];
  var setAnswers = answersRef[1];
  var artistsRef = useState([]);
  var selectedArtists = artistsRef[0];
  var setSelectedArtists = artistsRef[1];

  // Animation
  var animRef = useState(false);
  var animating = animRef[0];
  var setAnimating = animRef[1];

  function goForward() {
    if (animating) return;
    setDirection('forward');
    setAnimating(true);
    setTimeout(function () {
      setStep(function (s) { return s + 1; });
      setAnimating(false);
    }, 300);
  }

  function goBack() {
    if (animating || step <= 1) return;
    setDirection('back');
    setAnimating(true);
    setTimeout(function () {
      setStep(function (s) { return s - 1; });
      setAnimating(false);
    }, 300);
  }

  function handleQuestionSelect(key, value) {
    setAnswers(function (prev) {
      var next = Object.assign({}, prev);
      next[key] = value;
      return next;
    });
  }

  function toggleArtist(artist) {
    setSelectedArtists(function (prev) {
      if (prev.includes(artist)) {
        return prev.filter(function (a) { return a !== artist; });
      }
      if (prev.length < MAX_ARTISTS) {
        return prev.concat([artist]);
      }
      return prev;
    });
  }

  async function handleComplete() {
    if (!user) return;
    setSaving(true);

    var payload = {
      listeningStyle: answers.listeningStyle || '',
      soundWorld: answers.soundWorld || '',
      discoverySource: answers.discoverySource || '',
      musicRole: answers.musicRole || '',
      liveMusicVibe: answers.liveMusicVibe || '',
      favoriteArtists: selectedArtists,
    };

    var result = await supabase
      .from('profiles')
      .update({
        onboarding_answers: payload,
        favorite_artists: selectedArtists,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (result.error) {
      console.error('Failed to save onboarding answers:', result.error);
      setSaving(false);
      return;
    }

    navigate('/app/feed', { replace: true });
  }

  // Determine if continue is enabled
  var canContinue = step <= 5
    ? !!answers[QUESTIONS[step - 1].key]
    : selectedArtists.length >= MIN_ARTISTS;

  // Slide animation styles
  var slideStyle = {
    transition: animating ? 'transform 0.3s ease, opacity 0.3s ease' : 'none',
    transform: animating
      ? direction === 'forward'
        ? 'translateX(-30px)'
        : 'translateX(30px)'
      : 'translateX(0)',
    opacity: animating ? 0 : 1,
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
      <ProgressBar step={step} />

      <div style={Object.assign({ flex: 1 }, slideStyle)}>
        {step <= 5 ? (
          <QuestionStep
            question={QUESTIONS[step - 1]}
            selected={answers[QUESTIONS[step - 1].key] || ''}
            onSelect={function (val) { handleQuestionSelect(QUESTIONS[step - 1].key, val); }}
          />
        ) : (
          <ArtistStep
            selected={selectedArtists}
            onToggle={toggleArtist}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
        {step > 1 && (
          <button
            type="button"
            className="btn ghost"
            onClick={goBack}
            disabled={animating}
            style={{ flex: 0 }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="btn primary"
          onClick={step < TOTAL_STEPS ? goForward : handleComplete}
          disabled={!canContinue || animating || saving}
          style={{ flex: 1, opacity: canContinue ? 1 : 0.5 }}
        >
          {saving ? 'Saving...' : step < TOTAL_STEPS ? 'Continue' : 'Finish'}
        </button>
      </div>
    </div>
  );
}

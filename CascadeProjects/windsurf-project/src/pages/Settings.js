import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { supabase } from '../lib/supabaseClient';

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut, updatePassword } = useAuth();
  const { profile, saveProfile } = useCurrentUserProfile();

  // Account settings
  const [name, setName] = useState(profile.name || '');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  // Password change
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // Notification toggles
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifVibePing, setNotifVibePing] = useState(true);

  // Account management
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Help & support
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const [actionMsg, setActionMsg] = useState('');

  // Save name
  const handleSaveName = async () => {
    setSavingName(true);
    await saveProfile({ name: name.trim() });
    setSavingName(false);
    setEditingName(false);
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (newPw.length < 8 || !/[A-Z]/.test(newPw) || !/[0-9]/.test(newPw)) {
      setPwMsg('Password must be 8+ characters with an uppercase letter and a number.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    const { error } = await updatePassword(newPw);
    setSavingPw(false);
    if (error) {
      setPwMsg(error.message);
    } else {
      setPwMsg('Password updated successfully.');
      setNewPw('');
      setConfirmPw('');
      setShowPwForm(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Deactivate (soft — just sign out with message)
  const handleDeactivate = async () => {
    setActionMsg('Account deactivated. You can sign back in anytime to reactivate.');
    setShowDeactivate(false);
    setTimeout(async () => {
      await signOut();
      navigate('/');
    }, 2000);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    // Delete profile (cascade will clean up related data)
    await supabase.from('profiles').delete().eq('id', user.id);
    setActionMsg('Account deleted. Redirecting...');
    setShowDelete(false);
    setTimeout(async () => {
      await signOut();
      navigate('/');
    }, 2000);
  };

  // Submit report
  const handleReport = () => {
    if (!reportReason) return;
    setReportSent(true);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Manage your account and preferences.</p>
        </div>
      </header>

      {actionMsg && (
        <div className="section glass" style={{ background: 'rgba(34,197,94,0.15)', marginBottom: 12 }}>
          <p>{actionMsg}</p>
        </div>
      )}

      {/* ——— Account Settings ——— */}
      <section className="section glass">
        <h3>Account Settings</h3>

        <div style={{ marginTop: 8 }}>
          <div className="caption" style={{ marginBottom: 4 }}>Name</div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
              <button className="btn primary small" onClick={handleSaveName} disabled={savingName}>
                {savingName ? 'Saving...' : 'Save'}
              </button>
              <button className="btn ghost small" onClick={() => { setEditingName(false); setName(profile.name); }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{profile.name || '—'}</span>
              <button className="btn ghost small" onClick={() => setEditingName(true)}>Edit</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="caption" style={{ marginBottom: 4 }}>Email</div>
          <span>{user?.email || '—'}</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="caption" style={{ marginBottom: 4 }}>Password</div>
          {showPwForm ? (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              <input className="input" type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              {pwMsg && <p style={{ color: pwMsg.includes('success') ? 'var(--accent)' : 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{pwMsg}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn primary small" disabled={savingPw}>{savingPw ? 'Updating...' : 'Update Password'}</button>
                <button type="button" className="btn ghost small" onClick={() => { setShowPwForm(false); setPwMsg(''); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="btn ghost small" onClick={() => setShowPwForm(true)}>Change password</button>
          )}
        </div>
      </section>

      {/* ——— Notification Settings ——— */}
      <section className="section glass">
        <h3>Notification Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <ToggleRow label="Push notifications" checked={notifPush} onChange={setNotifPush} />
          <ToggleRow label="Email notifications" checked={notifEmail} onChange={setNotifEmail} />
          <ToggleRow label="Vibe Ping alerts" checked={notifVibePing} onChange={setNotifVibePing} />
        </div>
      </section>

      {/* ——— Account Management ——— */}
      <section className="section glass">
        <h3>Account Management</h3>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost small" onClick={() => setShowDeactivate(true)}>Deactivate account</button>
          <button className="btn ghost small" style={{ color: '#ef4444' }} onClick={() => setShowDelete(true)}>Delete account</button>
        </div>

        {showDeactivate && (
          <div className="glass" style={{ marginTop: 12, padding: 12, borderRadius: 8 }}>
            <p>Are you sure you want to deactivate your account? You can sign back in anytime to reactivate.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn primary small" onClick={handleDeactivate}>Yes, deactivate</button>
              <button className="btn ghost small" onClick={() => setShowDeactivate(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showDelete && (
          <div className="glass" style={{ marginTop: 12, padding: 12, borderRadius: 8 }}>
            <p style={{ color: '#ef4444' }}>This will permanently delete your account and all data. This cannot be undone.</p>
            <p className="caption" style={{ marginTop: 8 }}>Type <strong>DELETE</strong> to confirm:</p>
            <input className="input" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} style={{ marginTop: 4 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn primary small" style={{ background: '#ef4444' }} onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'}>
                Delete my account
              </button>
              <button className="btn ghost small" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {/* ——— Legal Notices ——— */}
      <section className="section glass">
        <h3>Legal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <button className="btn ghost small" style={{ textAlign: 'left' }} onClick={() => window.alert('Terms & Conditions — placeholder for your legal content.')}>
            Terms & Conditions
          </button>
          <button className="btn ghost small" style={{ textAlign: 'left' }} onClick={() => window.alert('Privacy Policy — placeholder for your legal content.')}>
            Privacy Policy
          </button>
        </div>
      </section>

      {/* ——— Help & Support ——— */}
      <section className="section glass">
        <h3>Help & Support</h3>
        {reportSent ? (
          <p className="caption" style={{ marginTop: 8 }}>Thank you. Your report has been submitted.</p>
        ) : showReport ? (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="caption">Reason</div>
            <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason...</option>
              <option value="bug">Bug or technical issue</option>
              <option value="harassment">Harassment or abuse</option>
              <option value="spam">Spam or fake account</option>
              <option value="content">Inappropriate content</option>
              <option value="other">Other</option>
            </select>
            <textarea
              className="input"
              rows={3}
              placeholder="Describe the issue (optional)..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary small" onClick={handleReport} disabled={!reportReason}>Submit report</button>
              <button className="btn ghost small" onClick={() => setShowReport(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn ghost small" style={{ marginTop: 8 }} onClick={() => setShowReport(true)}>Report an issue</button>
        )}
      </section>

      {/* ——— Sign Out ——— */}
      <section className="section glass">
        <button className="btn primary full-width" onClick={handleSignOut}>
          Sign Out
        </button>
      </section>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{label}</span>
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onPointerDown={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!checked); }}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? 'var(--accent, #e37e2f)' : 'rgba(255,255,255,0.12)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            transition: 'left 0.2s',
          }}
        />
      </div>
    </div>
  );
}

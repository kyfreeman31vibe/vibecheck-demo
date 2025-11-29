import React from 'react';

export function Settings() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Account, notifications, privacy (UI only)</p>
        </div>
      </header>
      <section className="section glass">
        <h3>Account</h3>
        <p className="caption">In a full app this would manage email, birthday, etc.</p>
      </section>
      <section className="section glass">
        <h3>Notifications</h3>
        <p className="caption">Mock toggles for email/SMS/push.</p>
      </section>
      <section className="section glass">
        <h3>Privacy</h3>
        <p className="caption">Mock controls for visibility and read receipts.</p>
      </section>
    </div>
  );
}

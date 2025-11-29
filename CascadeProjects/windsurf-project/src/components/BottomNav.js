import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Compass, CalendarDays, User } from 'lucide-react';

const tabs = [
  { to: '/app/dashboard', label: 'Home', Icon: Home },
  { to: '/app/feed', label: 'Feed', Icon: MessageCircle },
  { to: '/app/discover', label: 'Connect', Icon: Compass },
  { to: '/app/events', label: 'Events', Icon: CalendarDays },
  { to: '/app/profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, Icon }) => {
        const isActive = location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}
          >
            <Icon className="bottom-nav-icon" size={20} />
            <span className="bottom-nav-label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

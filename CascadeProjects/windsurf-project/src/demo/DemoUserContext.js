import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'vibecheck_demo_user';

const DemoUserContext = createContext({
  user: null,
  setUser: () => {},
});

export function DemoUserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const updateUser = (next) => {
    setUser(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  return (
    <DemoUserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </DemoUserContext.Provider>
  );
}

export function useDemoUser() {
  return useContext(DemoUserContext);
}

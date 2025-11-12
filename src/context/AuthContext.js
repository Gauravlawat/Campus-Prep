import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        // Demo support (unchanged)
        const urlParams = new URLSearchParams(window.location.search);
        const isDemo = urlParams.get('demo') === 'true';
        if (isDemo) {
          const demoUser = {
            _id: 'demo-user-id',
            email: 'demo@example.com',
            profile: { firstName: 'Demo', lastName: 'User' },
            gamification: { currentStreak: 10, totalCredits: 1000 },
          };
          setUser(demoUser);
          setToken(null);
          setLoading(false);
          return;
        }

        let res = await fetch('/api/auth/me', { credentials: 'include' });
        let data = await res.json();
        if (!data?.success) {
          // try refresh once
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          res = await fetch('/api/auth/me', { credentials: 'include' });
          data = await res.json();
        }
        if (data?.success) {
          setUser({ id: data.data.user.id, email: data.data.user.email, profile: data.data.user.profile, gamification: data.data.user.gamification });
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (userDataIgnored, tokenIgnored) => {
    // After /api/auth/login, cookies are set; fetch /api/auth/me
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data?.success) {
        setUser({ id: data.data.user.id, email: data.data.user.email, profile: data.data.user.profile, gamification: data.data.user.gamification });
      }
    } catch {}
    setToken(null);
    router.push('/');
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token: null, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSessionUser, getSessionUser, setSessionUser } from "./authStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // при старті app — підтягуємо сесію
  useEffect(() => {
    const saved = getSessionUser();
    if (saved) setUser(saved);
  }, []);

  const value = useMemo(() => {
    return {
      user,
      login: (u) => {
        setUser(u);
        setSessionUser(u);
      },
      logout: () => {
        setUser(null);
        clearSessionUser();
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

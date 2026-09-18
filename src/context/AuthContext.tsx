import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_STORAGE_KEY, SESSION_EXPIRED_EVENT } from "../utils/authEvents";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  businessName?: string;
};

type StoredAuth = {
  user: User | null;
  token: string | null;
  sessionExpired: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  expireSession: () => void;
  isAuthenticated: boolean;
  sessionExpired: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const EXPIRY_CHECK_INTERVAL_MS = 30_000;

function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return true;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    const payload = JSON.parse(atob(paddedPayload)) as {
      exp?: unknown;
    };

    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function loadStoredAuth(): StoredAuth {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return {
        user: null,
        token: null,
        sessionExpired: false,
      };
    }

    const parsed = JSON.parse(raw) as {
      user?: User;
      token?: string;
    };

    if (
      !parsed.user ||
      typeof parsed.token !== "string" ||
      isTokenExpired(parsed.token)
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      return {
        user: null,
        token: null,
        sessionExpired: Boolean(parsed.token),
      };
    }

    return {
      user: parsed.user,
      token: parsed.token,
      sessionExpired: false,
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);

    return {
      user: null,
      token: null,
      sessionExpired: false,
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(loadStoredAuth);
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [sessionExpired, setSessionExpired] = useState(stored.sessionExpired);

  const clearAuthentication = useCallback((expired: boolean) => {
    setUser(null);
    setToken(null);
    setSessionExpired(expired);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setSessionExpired(false);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: userData,
        token: authToken,
      }),
    );
  };

  const logout = useCallback(() => {
    clearAuthentication(false);
  }, [clearAuthentication]);

  const expireSession = useCallback(() => {
    clearAuthentication(true);
  }, [clearAuthentication]);

  useEffect(() => {
    const handleExpiredSession = () => {
      expireSession();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    };
  }, [expireSession]);

  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      if (isTokenExpired(token)) {
        expireSession();
      }
    };

    checkExpiry();

    const intervalId = window.setInterval(
      checkExpiry,
      EXPIRY_CHECK_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, [expireSession, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        expireSession,
        isAuthenticated: Boolean(token && user),
        sessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

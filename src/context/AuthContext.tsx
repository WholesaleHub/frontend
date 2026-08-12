import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "RETAILER" | "WHOLESALER" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  businessName?: string;
};

type StoredAuth = {
  user: User;
  token: string;
};

type JwtPayload = {
  exp?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "wholesalehub_auth";

const VALID_ROLES: UserRole[] = ["RETAILER", "WHOLESALER", "ADMIN"];

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64Url.length / 4) * 4, "=");

    return JSON.parse(window.atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenUsable(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1_000 > Date.now();
}

function isValidUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<User>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.fullName === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.role === "string" &&
    VALID_ROLES.includes(candidate.role.toUpperCase() as UserRole)
  );
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredAuth>;

    if (
      typeof parsed.token !== "string" ||
      !isValidUser(parsed.user) ||
      !isTokenUsable(parsed.token)
    ) {
      clearStoredAuth();
      return null;
    }

    return {
      token: parsed.token,
      user: {
        ...parsed.user,
        role: parsed.user.role.toUpperCase() as UserRole,
      },
    };
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState(loadStoredAuth);

  const [user, setUser] = useState<User | null>(initialAuth?.user ?? null);

  const [token, setToken] = useState<string | null>(initialAuth?.token ?? null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  }, []);

  const login = useCallback((userData: User, authToken: string) => {
    const normalizedUser: User = {
      ...userData,
      role: userData.role.toUpperCase() as UserRole,
    };

    setUser(normalizedUser);
    setToken(authToken);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: normalizedUser,
        token: authToken,
      }),
    );
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const payload = decodeJwtPayload(token);

    if (!payload?.exp) {
      logout();
      return;
    }

    const remainingTime = payload.exp * 1_000 - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(logout, remainingTime);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [token, logout]);

  useEffect(() => {
    function synchronizeAuth(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const storedAuth = loadStoredAuth();

      setUser(storedAuth?.user ?? null);
      setToken(storedAuth?.token ?? null);
    }

    window.addEventListener("storage", synchronizeAuth);

    return () => {
      window.removeEventListener("storage", synchronizeAuth);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

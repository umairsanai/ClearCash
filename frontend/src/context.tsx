import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { api } from "./api";
import type { User } from "./types";

interface UserContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User>;
  setUser: Dispatch<SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshRequestRef = useRef<Promise<User> | null>(null);

  const refreshUser = useCallback(async () => {
    if (refreshRequestRef.current) return refreshRequestRef.current;

    setLoading(true);

    const request = api
      .getMe()
      .then((nextUser) => {
        setUser(nextUser);
        return nextUser;
      })
      .finally(() => {
        setLoading(false);
        refreshRequestRef.current = null;
      });

    refreshRequestRef.current = request;
    return request;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, refreshUser, setUser, logout }),
    [user, loading, refreshUser, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}

export function useLoadUser() {
  const context = useUser();

  useEffect(() => {
    context.refreshUser().catch(() => undefined);
  }, [context.refreshUser]);

  return { user: context.user, loading: context.loading };
}

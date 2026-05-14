import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, removeToken, queryKeys, type User } from "./api";

interface AuthContextValue {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe();

  const logout = useCallback(() => {
    removeToken();
    queryClient.setQueryData(queryKeys.me(), null);
    queryClient.clear();
    window.location.href = "/";
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

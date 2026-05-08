import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { AuthUser } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey, useLogin, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: typeof useLogin extends () => infer R ? R["mutate"] : never;
  logout: typeof useLogout extends () => infer R ? R["mutate"] : never;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        setLocation("/admin");
      },
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/admin/login");
      },
    }
  });

  // If there's an error getting user (e.g. 401), we consider user as null.
  const actualUser = error ? null : (user ?? null);

  return (
    <AuthContext.Provider value={{
      user: actualUser,
      isLoading,
      login: loginMutation.mutate,
      logout: logoutMutation.mutate
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

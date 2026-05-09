import { createContext, useContext, ReactNode } from "react";
import { AuthUser, LoginBody } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey, useLogin, useLogout } from "@workspace/api-client-react";
import { useQueryClient, UseMutateFunction } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: UseMutateFunction<AuthUser, unknown, { data: LoginBody }, unknown>;
  logout: UseMutateFunction<unknown, unknown, void, unknown>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
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

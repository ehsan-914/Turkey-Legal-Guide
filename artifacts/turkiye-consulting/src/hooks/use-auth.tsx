import { createContext, useContext, ReactNode } from "react";
import { AuthUser, LoginBody, RegisterBody } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey, useLogin, useLogout, useRegister } from "@workspace/api-client-react";
import { useQueryClient, UseMutateFunction } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: UseMutateFunction<AuthUser, unknown, { data: LoginBody }, unknown>;
  logout: UseMutateFunction<unknown, unknown, void, unknown>;
  register: UseMutateFunction<AuthUser, unknown, { data: RegisterBody }, unknown>;
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
        if (data.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/client/dashboard");
        }
      },
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        setLocation("/client/dashboard");
      },
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/");
      },
    }
  });

  const actualUser = error ? null : (user ?? null);

  return (
    <AuthContext.Provider value={{
      user: actualUser,
      isLoading,
      login: loginMutation.mutate,
      logout: logoutMutation.mutate,
      register: registerMutation.mutate,
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

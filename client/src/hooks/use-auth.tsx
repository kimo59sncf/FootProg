import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Partial<SelectUser>, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Partial<SelectUser>, Error, InsertUser>;
  updateLanguage: (language: string) => Promise<void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: Partial<SelectUser>) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeBack", { name: user.username }),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.loginFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: Partial<SelectUser>) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.accountCreated"),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.registerFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t("auth.logoutSuccess"),
        description: t("auth.seeSoonAgain"),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.logoutFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLanguage = async (language: string) => {
    if (user) {
      try {
        await apiRequest("PATCH", "/api/profile", { language });
        
        // Update user data in cache
        queryClient.setQueryData(["/api/user"], {
          ...user,
          language
        });
        
        // Change i18n language
        await i18n.changeLanguage(language);
        
        toast({
          title: t("profile.languageUpdated"),
          description: t("profile.languageUpdateSuccess"),
        });
      } catch (error) {
        toast({
          title: t("profile.languageUpdateFailed"),
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    } else {
      // For non-authenticated users, just change the language
      await i18n.changeLanguage(language);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateLanguage,
      }}
    >
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

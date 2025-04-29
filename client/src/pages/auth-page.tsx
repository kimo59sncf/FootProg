import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volleyball, LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const { t } = useTranslation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(3, t("auth.validation.username")),
    password: z.string().min(6, t("auth.validation.password")),
  });

  // Register form schema
  const registerSchema = z.object({
    username: z.string().min(3, t("auth.validation.username")),
    email: z.string().email(t("auth.validation.email")),
    password: z.string().min(6, t("auth.validation.password")),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });

  // Create form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  // Submit handlers
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values);
  }

  // If user is already logged in, don't render the auth forms
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Auth Forms */}
            <div className="p-6 sm:p-8">
              <div className="mb-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start">
                  <Volleyball className="text-primary h-8 w-8 mr-2" />
                  <h1 className="text-2xl font-bold text-gray-900">FootballConnect</h1>
                </div>
                <p className="mt-2 text-gray-600">{t("auth.welcomeMessage")}</p>
              </div>

              <Tabs defaultValue="login" className="mt-8">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("auth.login")}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("auth.register")}
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  className="pl-10" 
                                  placeholder={t("auth.usernamePlaceholder")} 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  className="pl-10" 
                                  type="password" 
                                  placeholder={t("auth.passwordPlaceholder")} 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t("auth.loggingIn") : t("auth.login")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.firstName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.firstNamePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.lastName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.lastNamePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  className="pl-10" 
                                  placeholder={t("auth.usernamePlaceholder")} 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  className="pl-10" 
                                  type="email" 
                                  placeholder={t("auth.emailPlaceholder")} 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  className="pl-10" 
                                  type="password" 
                                  placeholder={t("auth.passwordPlaceholder")} 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? t("auth.registering") : t("auth.register")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>

            {/* Hero section */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-primary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/70 to-primary/40"></div>
              </div>
              <div className="relative p-8 flex flex-col justify-center h-full">
                <h2 className="text-3xl font-bold text-white mb-6">
                  {t("auth.hero.title")}
                </h2>
                <ul className="space-y-4 text-white">
                  <li className="flex items-start">
                    <div className="rounded-full bg-white/20 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{t("auth.hero.feature1")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white/20 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{t("auth.hero.feature2")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white/20 p-1 mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{t("auth.hero.feature3")}</span>
                  </li>
                </ul>
                <div className="mt-auto pt-8">
                  <p className="text-white/80 text-sm italic">
                    "{t("auth.hero.quote")}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

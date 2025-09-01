import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import LanguageSwitcher from "./language-switcher";
import { Menu, LogOut, User as UserIcon, ChevronDown, Home, Search, Plus, HelpCircle, Volleyball, CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/find-matches", label: t("nav.findMatch"), icon: <Search className="h-4 w-4 mr-2" /> },
    { href: "/calendar", label: "Calendrier", icon: <CalendarIcon className="h-4 w-4 mr-2" /> },
    { href: "/create-match", label: t("nav.createMatch"), icon: <Plus className="h-4 w-4 mr-2" /> },
    { href: "/how-it-works", label: t("nav.howItWorks"), icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Volleyball className="text-primary text-3xl mr-2 h-8 w-8" />
              <span className="font-bold text-xl text-primary">FootballConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium px-3 py-2 rounded-md transition ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* User menu or Auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate">{user.firstName || user.username}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost">{t("nav.login")}</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>{t("nav.register")}</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t("nav.openMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col h-full py-6">
                  <div className="space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-3 py-2 rounded-md transition ${
                          isActive(link.href)
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="px-3">
                      <LanguageSwitcher />
                    </div>

                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center px-3 py-2">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.firstName || user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start px-3" 
                          onClick={() => {
                            logoutMutation.mutate();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t("nav.logout")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 px-3">
                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                        </Link>
                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">{t("nav.register")}</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

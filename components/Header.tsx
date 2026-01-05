"use client";

import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NavButton from "@/components/NavButton";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

type Theme = "light" | "dark" | "system";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Tasks", href: "/tasks" },
  { label: "About", href: "/about" },
];

const Header: FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { theme = "light", setTheme } = useTheme() as {
    theme: Theme;
    setTheme: (theme: Theme) => void;
  };
  const { data: session, status } = useSession();

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  if (!mounted) return <div className="h-16" aria-hidden="true" />;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            TaskFlow
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-1" aria-label="Main menu">
              {NAV_ITEMS.map((item) => (
                <NavButton
                  key={item.href}
                  label={item.label}
                  href={item.href}
                />
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm"
                      aria-hidden="true"
                    >
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hi, {session?.user?.name?.split(" ")[0] || "User"}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                    disabled={isLoading}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowSignup(true)}
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-slide-down">
            <nav className="flex flex-col px-4 py-3 space-y-2">
              {NAV_ITEMS.map((item) => (
                <NavButton
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  isMobile
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}

              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Modals */}
      {showLogin && (
        <AuthModal
          title="Login to your account"
          onClose={() => setShowLogin(false)}
        >
          <LoginForm onSuccess={() => setShowLogin(false)} />
        </AuthModal>
      )}
      {showSignup && (
        <AuthModal
          title="Create an account"
          onClose={() => setShowSignup(false)}
        >
          <SignupForm
            onSuccess={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        </AuthModal>
      )}
    </>
  );
};

// Auth Modal Component
interface AuthModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const AuthModal: FC<AuthModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Header;

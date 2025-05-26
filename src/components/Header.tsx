
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarPlus, LogIn, LogOut, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, logout, isLoading, showAuthForm, setShowAuthForm } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLoginClick = () => {
    // If on homepage, toggle auth form. Otherwise, navigate to homepage to show auth form.
    if (pathname === '/') {
      setShowAuthForm(true);
    } else {
      router.push('/');
      // setShowAuthForm will be false by default on context or true if triggered after navigation
    }
  };
  
  const handleCreateEventClick = () => {
    if (!isAuthenticated) {
      if (pathname === '/') {
        setShowAuthForm(true);
      } else {
        router.push('/'); // Redirect to home to show login/register
      }
    } else {
      router.push('/create');
    }
  };

  const isLandingPageNoAuthForm = !isAuthenticated && pathname === '/' && !showAuthForm;

  if (isLoading) {
    return (
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            EventLink
          </div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          EventLink
        </Link>
        
        <nav className="flex items-center gap-2">
          {isLandingPageNoAuthForm ? (
            <Button variant="default" onClick={() => setShowAuthForm(true)}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : isAuthenticated ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
              </Button>
              <Button variant="default" onClick={handleCreateEventClick}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : ( // Not on landing page OR auth form is shown
            <>
              <Button asChild variant="ghost">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLoginClick}>
                 <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
               <Button variant="default" onClick={handleCreateEventClick}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

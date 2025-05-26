
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarPlus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/'); // Navigate to homepage which shows login form if not authenticated
  };

  if (isLoading) {
    return (
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            EventLink
          </Link>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div> {/* Skeleton for buttons */}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          EventLink
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild variant="default">
                <Link href="/create">
                  <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
                </Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              {/* For unauthenticated users, "Create Event" could also lead to login */}
              {/* Or simply show a Login button */}
              <Button variant="outline" onClick={handleLoginClick}>
                 <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
               <Button asChild variant="default">
                <Link href="/create">
                  <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

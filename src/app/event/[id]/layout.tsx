
"use client";

import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import type { Event } from '@/lib/types';

export default function EventViewLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const eventId = typeof params?.id === 'string' ? params.id : '';
  
  const { getEventById, isInitialized: storageInitialized } = useEventStorage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  // Use null to indicate loading state for ownership decision
  const [isOwnerOfEvent, setIsOwnerOfEvent] = useState<boolean | null>(null); 

  useEffect(() => {
    // Only proceed if auth and storage are initialized and we have an eventId
    if (!authLoading && storageInitialized && eventId) {
      const foundEvent = getEventById(eventId);
      setEvent(foundEvent || null);
      if (foundEvent && isAuthenticated && user) {
        setIsOwnerOfEvent(foundEvent.userId === user.id);
      } else {
        // Not owner if not authenticated, no user, or event not found by this ID
        setIsOwnerOfEvent(false); 
      }
    } else if (!authLoading && storageInitialized && !eventId) {
      // No eventId means cannot be owner of a specific event
      setIsOwnerOfEvent(false);
    }
    // If still authLoading or storageNotInitialized, isOwnerOfEvent remains null
  }, [eventId, getEventById, storageInitialized, user, isAuthenticated, authLoading]);

  // While determining ownership, render children in a basic state.
  // EventPage will show its own loading spinner if necessary.
  // RootLayout's <main> for /event/[id] paths has `flex-grow` (no container/padding).
  if (isOwnerOfEvent === null) {
    return (
      <div className="flex-grow">
        {children}
      </div>
    );
  }

  const showPageChrome = isOwnerOfEvent;
  
  return (
    <>
      {showPageChrome && <Header />}
      {/* This div ensures flex-grow behavior and applies container styling if owner */}
      <div className={`flex-grow ${showPageChrome ? 'container mx-auto px-4 py-8' : ''}`}>
        {children}
      </div>
      {showPageChrome && <Footer />}
    </>
  );
}


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
  
  const { getEventById } = useEventStorage(); // Removed isInitialized as Firestore hook is async
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isOwnerOfEvent, setIsOwnerOfEvent] = useState<boolean | null>(null); 
  const [isLoadingLayoutData, setIsLoadingLayoutData] = useState(true);

  useEffect(() => {
    async function loadLayoutData() {
      if (!authLoading && eventId) {
        setIsLoadingLayoutData(true);
        const foundEvent = await getEventById(eventId);
        setEvent(foundEvent || null);
        if (foundEvent && isAuthenticated && user) {
          setIsOwnerOfEvent(foundEvent.userId === user.id);
        } else {
          setIsOwnerOfEvent(false); 
        }
        setIsLoadingLayoutData(false);
      } else if (!authLoading && !eventId) {
        setIsOwnerOfEvent(false);
        setIsLoadingLayoutData(false);
      }
    }
    loadLayoutData();
  }, [eventId, getEventById, authLoading, user, isAuthenticated]);

  if (isLoadingLayoutData || authLoading) {
    return (
      <div className="flex-grow flex justify-center items-center min-h-screen">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-muted-foreground">Loading event layout...</p>
        </div>
      </div>
    );
  }
  
  const showPageChrome = isOwnerOfEvent;
  
  return (
    <>
      {showPageChrome && <Header />}
      <div className={`flex-grow ${showPageChrome ? 'container mx-auto px-4 py-8' : ''}`}>
        {children}
      </div>
      {showPageChrome && <Footer />}
    </>
  );
}


"use client";

import EventForm from '@/components/EventForm';
import type { Event } from '@/lib/types';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function CreateEventPage() {
  const { addEvent } = useEventStorage();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      router.push('/'); // Redirect to homepage which will show login form
    }
  }, [isLoading, isAuthenticated, router, toast]);

  const handleCreateEvent = (eventData: Event) => {
    // Add creator info if needed, e.g., eventData.createdBy = user?.id;
    addEvent(eventData);
    toast({
      title: "Event Created!",
      description: `Your event "${eventData.name}" has been successfully created.`,
    });
    router.push(`/event/${eventData.id}`);
  };

  if (isLoading || !isAuthenticated) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">{isLoading ? 'Loading authentication...' : 'Redirecting to login...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <EventForm onSubmit={handleCreateEvent} />
    </div>
  );
}

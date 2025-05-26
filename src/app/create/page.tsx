
"use client";

import EventForm from '@/components/EventForm';
import type { Event } from '@/lib/types';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function CreateEventPage() {
  const { addEvent } = useEventStorage();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      router.push('/'); 
    }
  }, [authIsLoading, isAuthenticated, router, toast]);

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'attendees' | 'userId' | 'views' | 'rsvpCounts'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated. Cannot create event.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const fullEventData = {
        ...eventData,
        userId: user.id, 
      };
      const createdEvent = await addEvent(fullEventData as Omit<Event, 'id' | 'attendees' | 'views' | 'rsvpCounts'> & { userId: string });
      toast({
        title: "Event Created!",
        description: `Your event "${createdEvent.name}" has been successfully created.`,
      });
      router.push(`/event/${createdEvent.id}`);
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        title: "Creation Failed",
        description: "Could not create your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading || !isAuthenticated) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">{authIsLoading ? 'Loading authentication...' : 'Redirecting to login...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Pass isSubmitting to EventForm if you want to disable its button too */}
      <EventForm onSubmit={handleCreateEvent} />
    </div>
  );
}

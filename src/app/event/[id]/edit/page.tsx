
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import EventForm, { type EventFormValues } from '@/components/EventForm';
import type { Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = typeof params.id === 'string' ? params.id : '';

  const { getEventById, updateEvent } = useEventStorage();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchEventForEditing() {
      if (!eventId) {
        setIsLoadingEvent(false);
        toast({ title: "Error", description: "Event ID is missing.", variant: "destructive" });
        router.push('/');
        return;
      }

      if (authIsLoading) return; // Wait for auth to resolve

      if (!isAuthenticated) {
        toast({ title: "Authentication Required", description: "Please log in to edit an event.", variant: "destructive" });
        router.push('/');
        setIsLoadingEvent(false);
        return;
      }
      
      setIsLoadingEvent(true);
      const foundEvent = await getEventById(eventId);

      if (foundEvent) {
        if (foundEvent.userId === user?.id) {
          setEventToEdit(foundEvent);
          setIsOwner(true);
        } else {
          toast({ title: "Access Denied", description: "You are not authorized to edit this event.", variant: "destructive" });
          router.push(`/event/${eventId}`);
        }
      } else {
        toast({ title: "Event Not Found", description: "The event you are trying to edit does not exist.", variant: "destructive" });
        router.push('/');
      }
      setIsLoadingEvent(false);
    }
    fetchEventForEditing();
  }, [eventId, getEventById, user, isAuthenticated, authIsLoading, router, toast]);

  const handleUpdateEvent = async (formData: EventFormValues) => {
    if (!eventToEdit || !isOwner) {
      toast({ title: "Error", description: "Cannot update event.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const updatedEventData: Partial<Omit<Event, 'id' | 'userId' | 'createdAt' | 'attendees' | 'views' | 'rsvpCounts'>> = {
      name: formData.name,
      date: format(formData.date, 'yyyy-MM-dd'), // Convert Date object to string
      time: formData.time,
      location: formData.location,
      description: formData.description,
      mapLink: formData.mapLink || '',
      images: formData.images.map(img => img.url).filter(url => url && url.trim() !== ''),
      tags: formData.tags,
      rsvpCollectFields: formData.rsvpCollectFields,
      allowEventSharing: formData.allowEventSharing,
      customStyles: formData.customStyles,
    };
    
    try {
      const updatedEvent = await updateEvent(eventToEdit.id, updatedEventData);
      if (updatedEvent) {
        toast({
          title: "Event Updated!",
          description: `Your event "${updatedEvent.name}" has been successfully updated.`,
        });
        router.push(`/event/${updatedEvent.id}`);
      } else {
        throw new Error("Failed to get updated event details.");
      }
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEvent || authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">{authIsLoading ? 'Authenticating...' : 'Loading event details...'}</p>
        </div>
      </div>
    );
  }

  if (!eventToEdit || !isOwner) {
    // This case should ideally be handled by the redirects in useEffect,
    // but it's a fallback.
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-destructive">You do not have permission to edit this event or the event was not found.</p>
      </div>
    );
  }

  // Prepare initialValues for EventForm
  const initialFormValues: EventFormValues = {
    name: eventToEdit.name,
    date: new Date(eventToEdit.date + 'T00:00:00'), // Convert YYYY-MM-DD string to Date object
    time: eventToEdit.time,
    location: eventToEdit.location,
    description: eventToEdit.description,
    mapLink: eventToEdit.mapLink || '',
    images: eventToEdit.images.map(url => ({ url })) || [{url: ''}],
    tags: eventToEdit.tags || [],
    rsvpCollectFields: eventToEdit.rsvpCollectFields || { name: true, email: false, phone: false },
    allowEventSharing: eventToEdit.allowEventSharing !== undefined ? eventToEdit.allowEventSharing : true,
    customStyles: eventToEdit.customStyles || {
        pageBackgroundColor: '#F7FAFC',
        contentBackgroundColor: '#FFFFFF',
        textColor: '#363C4A',
        iconAndTitleColor: '#10B981',
        fontEventName: 'inherit',
        fontTitles: 'inherit',
        fontDescription: 'inherit',
    },
  };
  if (initialFormValues.images.length === 0) { // Ensure at least one image input
    initialFormValues.images = [{url: ''}];
  }


  return (
    <div>
      <EventForm 
        onSubmit={handleUpdateEvent} 
        initialValues={initialFormValues}
        submitButtonText="Update Event"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}


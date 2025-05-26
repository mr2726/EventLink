
"use client";

import type { Event, RSVPStatus, EventRSVP, Attendee } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const EVENTS_STORAGE_KEY = 'eventlink_events';
const RSVPS_STORAGE_KEY = 'eventlink_rsvps'; // For session-based RSVP feedback

function getInitialEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  let parsedEvents = [];
  if (storedEvents) {
    try {
      parsedEvents = JSON.parse(storedEvents);
    } catch (e) {
      console.error("Failed to parse events from localStorage", e);
      parsedEvents = [];
    }
  }
  
  return parsedEvents.map((event: any) => ({
    ...event,
    userId: event.userId || 'unknown_user', // Add default for old events
    views: event.views || 0,
    rsvpCounts: event.rsvpCounts || { going: 0, maybe: 0, not_going: 0 },
    rsvpCollectFields: event.rsvpCollectFields || { name: false, email: false, phone: false },
    attendees: event.attendees || [],
  }));
}

function getInitialRSVPs(): EventRSVP[] { // For session-based RSVP feedback
  if (typeof window === 'undefined') return [];
  const storedRSVPs = localStorage.getItem(RSVPS_STORAGE_KEY);
   if (storedRSVPs) {
    try {
      return JSON.parse(storedRSVPs);
    } catch (e) {
      console.error("Failed to parse RSVPs from localStorage", e);
      return [];
    }
  }
  return [];
}

export function useEventStorage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRSVPs] = useState<EventRSVP[]>([]); // Tracks current session's RSVP for UI feedback
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setEvents(getInitialEvents());
    setRSVPs(getInitialRSVPs());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(rsvps));
    }
  }, [rsvps, isInitialized]);

  const addEvent = useCallback((newEventData: Omit<Event, 'id' | 'attendees'>): Event => {
    const fullNewEvent: Event = {
      id: crypto.randomUUID(),
      ...newEventData, // userId should be included here from the caller
      views: newEventData.views || 0,
      rsvpCounts: newEventData.rsvpCounts || { going: 0, maybe: 0, not_going: 0 },
      rsvpCollectFields: newEventData.rsvpCollectFields || { name: false, email: false, phone: false },
      attendees: [], // Initialize attendees
    };
    setEvents((prevEvents) => [...prevEvents, fullNewEvent]);
    return fullNewEvent;
  }, []);
  

  const getEventById = useCallback((id: string): Event | undefined => {
    return events.find(event => event.id === id);
  }, [events]);

  const incrementEventView = useCallback((eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, views: (event.views || 0) + 1 } : event
      )
    );
  }, []);

  const saveRSVP = useCallback((
    eventId: string, 
    newStatus: RSVPStatus, 
    details: { name?: string; email?: string; phone?: string }
  ) => {
    
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId) {
          const newAttendee: Attendee = {
            id: crypto.randomUUID(),
            status: newStatus,
            submittedAt: new Date().toISOString(),
            name: details.name,
            email: details.email,
            phone: details.phone,
          };
          
          const updatedAttendees = [...(event.attendees || []), newAttendee];
          
          // Recalculate rsvpCounts based on the updated attendees list
          const newRsvpCounts = { going: 0, maybe: 0, not_going: 0 };
          updatedAttendees.forEach(attendee => {
            if (attendee.status) { // Ensure status is defined
                 newRsvpCounts[attendee.status]++;
            }
          });
          
          return { ...event, attendees: updatedAttendees, rsvpCounts: newRsvpCounts };
        }
        return event;
      });
    });

    // Update session-specific RSVP tracking for immediate UI feedback on the event page
    setRSVPs((prevRSVPs) => {
      const existingRSVPIndex = prevRSVPs.findIndex(r => r.eventId === eventId);
      if (existingRSVPIndex > -1) {
        const updatedRSVPs = [...prevRSVPs];
        updatedRSVPs[existingRSVPIndex] = { eventId, status: newStatus };
        return updatedRSVPs;
      }
      return [...prevRSVPs, { eventId, status: newStatus }];
    });
  }, []); 

  const getRSVPForEvent = useCallback((eventId: string): RSVPStatus | undefined => {
    // This gets the RSVP status for the current session/user for this event
    return rsvps.find(rsvp => rsvp.eventId === eventId)?.status;
  }, [rsvps]);

  return {
    events,
    addEvent,
    getEventById,
    saveRSVP,
    getRSVPForEvent,
    incrementEventView,
    isInitialized
  };
}

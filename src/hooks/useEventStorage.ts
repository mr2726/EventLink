
"use client";

import type { Event, RSVPStatus, EventRSVP } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const EVENTS_STORAGE_KEY = 'eventlink_events';
const RSVPS_STORAGE_KEY = 'eventlink_rsvps';

function getInitialEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];
  // Ensure all events have the new fields for backward compatibility
  return parsedEvents.map((event: any) => ({
    ...event,
    views: event.views || 0,
    rsvpCounts: event.rsvpCounts || { going: 0, maybe: 0, not_going: 0 },
  }));
}

function getInitialRSVPs(): EventRSVP[] {
  if (typeof window === 'undefined') return [];
  const storedRSVPs = localStorage.getItem(RSVPS_STORAGE_KEY);
  return storedRSVPs ? JSON.parse(storedRSVPs) : [];
}

export function useEventStorage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRSVPs] = useState<EventRSVP[]>([]);
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

  const addEvent = useCallback((newEventData: Omit<Event, 'id' | 'views' | 'rsvpCounts'> & Partial<Pick<Event, 'views' | 'rsvpCounts'>>) => {
    const fullNewEvent: Event = {
      id: crypto.randomUUID(),
      ...newEventData,
      views: newEventData.views || 0,
      rsvpCounts: newEventData.rsvpCounts || { going: 0, maybe: 0, not_going: 0 },
    };
    setEvents((prevEvents) => [...prevEvents, fullNewEvent]);
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

  const saveRSVP = useCallback((eventId: string, newStatus: RSVPStatus) => {
    // Update aggregate counts
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId) {
          const updatedRsvpCounts = { ...(event.rsvpCounts || { going: 0, maybe: 0, not_going: 0 }) };
          
          // Find current individual RSVP for this event to decrement previous status if changed
          const currentIndividualRSVP = rsvps.find(r => r.eventId === eventId);

          if (currentIndividualRSVP && currentIndividualRSVP.status !== newStatus) {
            if (updatedRsvpCounts[currentIndividualRSVP.status] > 0) {
              updatedRsvpCounts[currentIndividualRSVP.status]--;
            }
          }
          
          updatedRsvpCounts[newStatus]++;
          
          return { ...event, rsvpCounts: updatedRsvpCounts };
        }
        return event;
      });
    });

    // Update individual RSVP tracking
    setRSVPs((prevRSVPs) => {
      const existingRSVPIndex = prevRSVPs.findIndex(r => r.eventId === eventId);
      if (existingRSVPIndex > -1) {
        const updatedRSVPs = [...prevRSVPs];
        updatedRSVPs[existingRSVPIndex] = { eventId, status: newStatus };
        return updatedRSVPs;
      }
      return [...prevRSVPs, { eventId, status: newStatus }];
    });
  }, [rsvps]); // Added rsvps to dependency array

  const getRSVPForEvent = useCallback((eventId: string): RSVPStatus | undefined => {
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

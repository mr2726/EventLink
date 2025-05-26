"use client";

import type { Event, RSVPStatus, EventRSVP } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const EVENTS_STORAGE_KEY = 'eventlink_events';
const RSVPS_STORAGE_KEY = 'eventlink_rsvps';

function getInitialEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  return storedEvents ? JSON.parse(storedEvents) : [];
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

  const addEvent = useCallback((newEvent: Event) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  }, []);

  const getEventById = useCallback((id: string): Event | undefined => {
    return events.find(event => event.id === id);
  }, [events]);

  const saveRSVP = useCallback((eventId: string, status: RSVPStatus) => {
    setRSVPs((prevRSVPs) => {
      const existingRSVPIndex = prevRSVPs.findIndex(r => r.eventId === eventId);
      if (existingRSVPIndex > -1) {
        const updatedRSVPs = [...prevRSVPs];
        updatedRSVPs[existingRSVPIndex] = { eventId, status };
        return updatedRSVPs;
      }
      return [...prevRSVPs, { eventId, status }];
    });
  }, []);

  const getRSVPForEvent = useCallback((eventId: string): RSVPStatus | undefined => {
    return rsvps.find(rsvp => rsvp.eventId === eventId)?.status;
  }, [rsvps]);

  return {
    events,
    addEvent,
    getEventById,
    saveRSVP,
    getRSVPForEvent,
    isInitialized
  };
}

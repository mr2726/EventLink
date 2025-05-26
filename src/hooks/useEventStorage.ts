
"use client";

import type { Event, RSVPStatus, Attendee } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore instance
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

// Helper to convert Firestore Timestamps in event data
const convertEventTimestamps = (eventData: any): Event => {
  const data = { ...eventData };
  if (data.date && typeof data.date === 'string') {
    // Assuming date is stored as YYYY-MM-DD string, no conversion needed here for display
    // If date were a Firestore Timestamp:
    // data.date = (data.date as Timestamp)?.toDate().toISOString().split('T')[0] || null;
  }
  if (data.attendees) {
    data.attendees = data.attendees.map((attendee: any) => {
      if (attendee.submittedAt && attendee.submittedAt instanceof Timestamp) {
        return { ...attendee, submittedAt: attendee.submittedAt.toDate().toISOString() };
      }
      return attendee;
    });
  }
  return data as Event;
};


export function useEventStorage() {
  const [events, setEvents] = useState<Event[]>([]); // For homepage display of user's events
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); // For initial load of user's events
  const [isInitialized, setIsInitialized] = useState(false); // General initialization
  const { user } = useAuth();

  // Fetch user's events for the homepage
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (user && user.id) {
        setIsLoadingEvents(true);
        try {
          const q = query(collection(db, 'events'), where('userId', '==', user.id));
          const querySnapshot = await getDocs(q);
          const userEvents: Event[] = [];
          querySnapshot.forEach((doc) => {
            userEvents.push(convertEventTimestamps({ id: doc.id, ...doc.data() } as Event));
          });
          setEvents(userEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date
        } catch (error) {
          console.error("Error fetching user events:", error);
          setEvents([]);
        } finally {
          setIsLoadingEvents(false);
          setIsInitialized(true); // Mark as initialized after first attempt
        }
      } else if (!user) {
        setEvents([]); // Clear events if no user
        setIsLoadingEvents(false);
        setIsInitialized(true);
      }
    };
    fetchUserEvents();
  }, [user]);


  const addEvent = useCallback(async (newEventData: Omit<Event, 'id' | 'attendees' | 'views' | 'rsvpCounts'> & { userId: string }): Promise<Event> => {
    try {
      const eventToCreate = {
        ...newEventData,
        views: 0,
        rsvpCounts: { going: 0, maybe: 0, not_going: 0 },
        attendees: [],
        createdAt: serverTimestamp(), // Firestore server timestamp
      };
      const docRef = await addDoc(collection(db, 'events'), eventToCreate);
      // After adding, refetch user's events to update the list on homepage
      if (user && user.id) {
        const q = query(collection(db, 'events'), where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const userEventsList: Event[] = [];
        querySnapshot.forEach((doc) => {
          userEventsList.push(convertEventTimestamps({ id: doc.id, ...doc.data() } as Event));
        });
        setEvents(userEventsList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      return { id: docRef.id, ...eventToCreate, attendees: [], createdAt: new Date().toISOString() } as Event; // Return with ID
    } catch (error) {
      console.error("Error adding event to Firestore:", error);
      throw error; // Re-throw to be caught by caller
    }
  }, [user]);


  const getEventById = useCallback(async (id: string): Promise<Event | null> => {
    if (!id) return null;
    try {
      const eventDocRef = doc(db, 'events', id);
      const eventSnap = await getDoc(eventDocRef);
      if (eventSnap.exists()) {
        return convertEventTimestamps({ id: eventSnap.id, ...eventSnap.data() } as Event);
      } else {
        console.log("No such event document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      return null;
    }
  }, []);

  const incrementEventView = useCallback(async (eventId: string) => {
    if (!eventId) return;
    try {
      const eventDocRef = doc(db, 'events', eventId);
      await updateDoc(eventDocRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing event view:", error);
    }
  }, []);

  const saveRSVP = useCallback(async (
    eventId: string,
    newStatus: RSVPStatus,
    details: { name?: string; email?: string; phone?: string }
  ) => {
    if (!eventId) return;
    try {
      const eventDocRef = doc(db, 'events', eventId);
      const newAttendee: Omit<Attendee, 'id'> & {submittedAt: any} = { // Omit id, it's part of the array not the object ID
        status: newStatus,
        submittedAt: serverTimestamp(), // Firestore server timestamp
        name: details.name || undefined,
        email: details.email || undefined,
        phone: details.phone || undefined,
      };

      // Atomically update attendees array and increment RSVP count
      await updateDoc(eventDocRef, {
        attendees: arrayUnion({...newAttendee, id: crypto.randomUUID()}), // Add new attendee to the array
        [`rsvpCounts.${newStatus}`]: increment(1) // Increment the specific status count
      });

      // Note: If a user could change their RSVP, logic to decrement old status count would be needed.
      // For this prototype, each RSVP is a new entry and increments.

    } catch (error) {
      console.error("Error saving RSVP to Firestore:", error);
      throw error;
    }
  }, []);

  // getRSVPForEvent is tricky with Firestore without user-specific RSVP tracking.
  // For now, this will be removed as individual RSVP status per user session is less relevant
  // when all attendees are stored in the event. The UI will reflect if *an* RSVP was made.
  // const getRSVPForEvent = useCallback((eventId: string): RSVPStatus | undefined => {
  // return undefined; // Or retrieve from local session storage if desired for UI feedback
  // }, []);

  return {
    events, // User's events for homepage
    isLoadingEvents, // Loading state for user's events
    addEvent,
    getEventById,
    saveRSVP,
    // getRSVPForEvent, // Removed for now
    incrementEventView,
    isInitialized // General hook initialization status
  };
}

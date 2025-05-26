
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
  arrayUnion,
  FieldValue // Added FieldValue for serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

// Helper to convert Firestore Timestamps in event data
const convertEventTimestamps = (eventData: any): Event => {
  const data = { ...eventData };
  if (data.date && typeof data.date === 'string') {
    // Assuming date is stored as YYYY-MM-DD string, no conversion needed here for display
  }
  if (data.createdAt && data.createdAt instanceof Timestamp) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.attendees) {
    data.attendees = data.attendees.map((attendee: any) => {
      const updatedAttendee = { ...attendee };
      if (attendee.submittedAt && attendee.submittedAt instanceof Timestamp) {
        updatedAttendee.submittedAt = attendee.submittedAt.toDate().toISOString();
      }
      return updatedAttendee;
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
          setEvents(userEvents.sort((a,b) => {
             const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
             const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
             return dateB - dateA; // Sort by creation date, newest first
          }));
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


  const addEvent = useCallback(async (newEventData: Omit<Event, 'id' | 'attendees' | 'views' | 'rsvpCounts' | 'createdAt'> & { userId: string }): Promise<Event> => {
    try {
      const eventToCreate = {
        ...newEventData,
        views: 0,
        rsvpCounts: { going: 0, maybe: 0, not_going: 0 },
        attendees: [],
        createdAt: serverTimestamp() as FieldValue,
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
        setEvents(userEventsList.sort((a,b) => {
            const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
            return dateB - dateA;
        }));
      }
      // For the returned event, we simulate the serverTimestamp with a client-side date
      // as Firestore wouldn't have resolved it yet for the return value.
      const createdEventData = { ...eventToCreate, id: docRef.id, createdAt: new Date().toISOString() };
      return convertEventTimestamps(createdEventData as any) as Event;
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
      
      // Prepare attendee data, only including fields that have values
      const attendeeDataForFirestore: {
        id: string;
        status: RSVPStatus;
        submittedAt: FieldValue;
        name?: string;
        email?: string;
        phone?: string;
      } = {
        id: crypto.randomUUID(),
        status: newStatus,
        submittedAt: serverTimestamp() as FieldValue,
      };

      if (details.name && details.name.trim() !== "") {
        attendeeDataForFirestore.name = details.name.trim();
      }
      if (details.email && details.email.trim() !== "") {
        attendeeDataForFirestore.email = details.email.trim();
      }
      if (details.phone && details.phone.trim() !== "") {
        attendeeDataForFirestore.phone = details.phone.trim();
      }

      // Atomically update attendees array and increment RSVP count
      await updateDoc(eventDocRef, {
        attendees: arrayUnion(attendeeDataForFirestore),
        [`rsvpCounts.${newStatus}`]: increment(1)
      });

    } catch (error) {
      console.error("Error saving RSVP to Firestore:", error);
      throw error;
    }
  }, []);


  return {
    events,
    isLoadingEvents,
    addEvent,
    getEventById,
    saveRSVP,
    incrementEventView,
    isInitialized
  };
}

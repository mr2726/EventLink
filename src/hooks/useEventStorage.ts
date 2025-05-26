
"use client";

import type { Event, RSVPStatus, Attendee, CustomEventStyles } from '@/lib/types';
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
  deleteDoc, // Import deleteDoc
  type FieldValue
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

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
  // Ensure customStyles exists, defaulting if necessary
  if (!data.customStyles) {
    data.customStyles = {}; // Default to empty object if not present
  }
  return data as Event;
};


export function useEventStorage() {
  const [events, setEvents] = useState<Event[]>([]); // For homepage display of user's events
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); // For initial load of user's events
  const [isInitialized, setIsInitialized] = useState(false); // General initialization
  const { user } = useAuth();
  const { toast } = useToast();


  // Fetch user's events for the homepage
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (user && user.id) {
        setIsLoadingEvents(true);
        try {
          const q = query(collection(db, 'events'), where('userId', '==', user.id));
          const querySnapshot = await getDocs(q);
          const userEventsData: Event[] = [];
          querySnapshot.forEach((doc) => {
            userEventsData.push(convertEventTimestamps({ id: doc.id, ...doc.data() } as Event));
          });
          setEvents(userEventsData.sort((a,b) => {
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
        allowEventSharing: newEventData.allowEventSharing !== undefined ? newEventData.allowEventSharing : true,
        rsvpCollectFields: newEventData.rsvpCollectFields || { name: true, email: false, phone: false },
        customStyles: newEventData.customStyles || {},
        createdAt: serverTimestamp() as FieldValue,
      };
      const docRef = await addDoc(collection(db, 'events'), eventToCreate);
      
      const newEventSnap = await getDoc(docRef);
      if (newEventSnap.exists()) {
        const createdEvent = convertEventTimestamps({ id: newEventSnap.id, ...newEventSnap.data() });
        
        if (user && user.id === createdEvent.userId) { 
            setEvents(prevEvents => 
                [createdEvent, ...prevEvents].sort((a,b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
                    return dateB - dateA;
                })
            );
        }
        return createdEvent;
      } else {
        // Fallback in case getDoc fails immediately (network issue, etc.)
        // This is less likely with Firestore but good for robustness
        const clientSideCreatedEvent = { ...eventToCreate, id: docRef.id, createdAt: new Date().toISOString() } as any;
        return convertEventTimestamps(clientSideCreatedEvent) as Event;
      }

    } catch (error) {
      console.error("Error adding event to Firestore:", error);
      throw error; 
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
      
      const attendeeDataForFirestore: {
        id: string;
        status: RSVPStatus;
        submittedAt: Timestamp; 
        name?: string;
        email?: string;
        phone?: string;
      } = {
        id: crypto.randomUUID(),
        status: newStatus,
        submittedAt: Timestamp.now(), // Changed from serverTimestamp()
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

      await updateDoc(eventDocRef, {
        attendees: arrayUnion(attendeeDataForFirestore),
        [`rsvpCounts.${newStatus}`]: increment(1)
      });

    } catch (error) {
      console.error("Error saving RSVP to Firestore:", error);
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!eventId) {
      throw new Error("Event ID is required to delete an event.");
    }
    try {
      const eventDocRef = doc(db, 'events', eventId);
      await deleteDoc(eventDocRef);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      // Toast notification for success is handled in the component calling this
    } catch (error) {
      console.error("Error deleting event from Firestore:", error);
      // Toast notification for error is handled in the component calling this
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
    deleteEvent, // Expose deleteEvent
    isInitialized
  };
}

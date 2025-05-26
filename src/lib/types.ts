
import type { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  userId: string; 
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  description: string;
  mapLink?: string;
  images: string[]; 
  tags: string[];
  template: string; 
  views: number;
  rsvpCounts: {
    going: number;
    maybe: number;
    not_going: number;
  };
  rsvpCollectFields: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
  attendees: Attendee[];
  allowEventSharing: boolean;
  createdAt?: Timestamp | string; // Stored as Firestore Timestamp, converted to string on read
}

export interface Attendee {
  id: string; 
  name?: string;
  email?: string;
  phone?: string;
  status: RSVPStatus;
  submittedAt: Timestamp | string; // Stored as Firestore Timestamp, converted to string on read
}

export type RSVPStatus = "going" | "maybe" | "not_going";

// This can be removed if not used for session-specific RSVP feedback anymore
// export interface EventRSVP {
//   eventId: string;
//   status: RSVPStatus;
// }

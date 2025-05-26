
import type { Timestamp } from 'firebase/firestore';

export interface CustomEventStyles {
  pageBackgroundColor?: string;
  contentBackgroundColor?: string;
  textColor?: string;
  iconAndTitleColor?: string; // For icons and main event name title
  fontEventName?: string;
  fontTitles?: string; // For section headers like Date, Time, Location
  fontDescription?: string; // For main event description text
}

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
  template: string; // Currently not used for styling, but kept for future
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
  customStyles?: CustomEventStyles;
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

export interface Event {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  description: string;
  mapLink?: string;
  images: string[]; // Array of image URLs
  tags: string[];
  template: string; // e.g., 'default', 'modern', 'classic'
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
}

export interface Attendee {
  id: string; // Unique ID for this RSVP submission
  name?: string;
  email?: string;
  phone?: string;
  status: RSVPStatus;
  submittedAt: string; // ISO date string for when the RSVP was made
}

export type RSVPStatus = "going" | "maybe" | "not_going";

export interface EventRSVP {
  eventId: string;
  status: RSVPStatus;
  // The EventRSVP is for per-session feedback, not for storing all attendee details.
  // Details like name, email, phone will be part of the Attendee interface.
}

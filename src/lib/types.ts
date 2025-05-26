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
}

export type RSVPStatus = "going" | "maybe" | "not_going";

export interface EventRSVP {
  eventId: string;
  status: RSVPStatus;
}

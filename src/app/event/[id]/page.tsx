
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event, RSVPStatus } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, MapPin, ExternalLink, Image as ImageIcon, Tag, CheckCircle, HelpCircle, XCircle, MessageSquare, Link2, Copy, User, AtSign, Phone } from 'lucide-react';
import NextImage from 'next/image';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, saveRSVP, getRSVPForEvent, incrementEventView, isInitialized } = useEventStorage();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [currentRSVP, setCurrentRSVP] = useState<RSVPStatus | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [eventUrl, setEventUrl] = useState<string>('');
  const [viewIncremented, setViewIncremented] = useState(false);

  // State for RSVP input fields
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');

  const eventId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEventUrl(window.location.href);
    }

    if (isInitialized && eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setCurrentRSVP(getRSVPForEvent(eventId)); // This gets the *session's* last RSVP status
        if (foundEvent.images.length > 0) {
          setSelectedImage(foundEvent.images[0]);
        }
        if (!viewIncremented) {
          incrementEventView(eventId);
          setViewIncremented(true);
        }
      } else {
        toast({ title: "Event not found", variant: "destructive", description: "Could not find the event details. It might have been removed or the link is incorrect." });
        router.push('/');
      }
    }
  }, [eventId, getEventById, isInitialized, getRSVPForEvent, incrementEventView, router, toast, viewIncremented]);

  const handleRSVP = (status: RSVPStatus) => {
    if (!event) return;

    const details: { name?: string; email?: string; phone?: string } = {};
    let canSubmit = true;

    if (event.rsvpCollectFields.name) {
      if (!rsvpName.trim()) {
        toast({ title: "Name Required", description: "Please enter your name to RSVP.", variant: "destructive" });
        canSubmit = false;
      } else {
        details.name = rsvpName.trim();
      }
    }
    if (event.rsvpCollectFields.email) {
      if (!rsvpEmail.trim()) { // Basic check, could add email format validation
        toast({ title: "Email Required", description: "Please enter your email to RSVP.", variant: "destructive" });
        canSubmit = false;
      } else {
        details.email = rsvpEmail.trim();
      }
    }
    if (event.rsvpCollectFields.phone) {
      if (!rsvpPhone.trim()) {
        toast({ title: "Phone Required", description: "Please enter your phone number to RSVP.", variant: "destructive" });
        canSubmit = false;
      } else {
        details.phone = rsvpPhone.trim();
      }
    }

    if (!canSubmit) return;

    saveRSVP(event.id, status, details);
    setCurrentRSVP(status); // Update UI for current session's choice
    toast({
      title: "RSVP Submitted!",
      description: `You responded: ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
    });
    // Optionally clear fields after submission
    setRsvpName('');
    setRsvpEmail('');
    setRsvpPhone('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        toast({ title: "Link Copied!", description: "Event link copied to clipboard." });
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      });
  };

  if (!isInitialized || !event) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">{!isInitialized ? "Initializing..." : "Loading event details..."}</p>
        </div>
      </div>
    );
  }
  
  let formattedDate = "Date not available";
  try {
    const dateObj = new Date(event.date);
    if (!isNaN(dateObj.getTime())) { 
       const offsetDate = new Date(dateObj.valueOf() + dateObj.getTimezoneOffset() * 60 * 1000);
       formattedDate = format(offsetDate, "EEEE, MMMM dd, yyyy");
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-2xl">
        {selectedImage && (
          <div className="relative w-full h-64 md:h-96 bg-muted">
            <NextImage
              src={selectedImage}
              alt={event.name}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-300 ease-in-out"
              data-ai-hint="event highlight"
            />
          </div>
        )}
        {event.images.length > 1 && (
          <div className="p-4 bg-card-foreground/5 flex gap-2 overflow-x-auto">
            {event.images.map((imgUrl, idx) => (
              <button key={idx} onClick={() => setSelectedImage(imgUrl)} className={cn("h-16 w-16 rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-primary", selectedImage === imgUrl ? "border-primary" : "border-transparent hover:border-primary/50")}>
                <NextImage src={imgUrl} alt={`${event.name} thumbnail ${idx+1}`} width={64} height={64} objectFit="cover" data-ai-hint="event photo" />
              </button>
            ))}
          </div>
        )}

        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">{event.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            You're invited! Join us for this special occasion.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8 px-6 md:px-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div className="flex items-start">
              <CalendarDays className="h-8 w-8 text-primary mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Date</h3>
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-8 w-8 text-primary mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Time</h3>
                <p className="text-muted-foreground">{event.time}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start text-lg">
            <MapPin className="h-8 w-8 text-primary mr-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-muted-foreground">{event.location}</p>
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-accent hover:underline mt-1"
                >
                  View Map <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center"><MessageSquare className="h-6 w-6 text-primary mr-3" /> About the Event</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          {event.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center"><Tag className="h-6 w-6 text-primary mr-3" /> Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/50 p-6 md:p-8 border-t flex-col space-y-6">
          <div className="w-full space-y-4 text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Will you attend?</h3>

            {/* RSVP Input Fields */}
            {(event.rsvpCollectFields.name || event.rsvpCollectFields.email || event.rsvpCollectFields.phone) && (
              <div className="space-y-4 mb-6 max-w-md mx-auto text-left">
                {event.rsvpCollectFields.name && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-name" className="flex items-center text-sm font-medium text-foreground">
                      <User className="mr-2 h-4 w-4 text-primary" /> Name
                    </Label>
                    <Input 
                      id="rsvp-name" 
                      type="text" 
                      placeholder="Your Name" 
                      value={rsvpName} 
                      onChange={(e) => setRsvpName(e.target.value)} 
                      className="bg-background/70"
                    />
                  </div>
                )}
                {event.rsvpCollectFields.email && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-email" className="flex items-center text-sm font-medium text-foreground">
                      <AtSign className="mr-2 h-4 w-4 text-primary" /> Email
                    </Label>
                    <Input 
                      id="rsvp-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={rsvpEmail} 
                      onChange={(e) => setRsvpEmail(e.target.value)} 
                      className="bg-background/70"
                    />
                  </div>
                )}
                {event.rsvpCollectFields.phone && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-phone" className="flex items-center text-sm font-medium text-foreground">
                      <Phone className="mr-2 h-4 w-4 text-primary" /> Phone Number
                    </Label>
                    <Input 
                      id="rsvp-phone" 
                      type="tel" 
                      placeholder="Your Phone Number" 
                      value={rsvpPhone} 
                      onChange={(e) => setRsvpPhone(e.target.value)} 
                      className="bg-background/70"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {(['going', 'maybe', 'not_going'] as RSVPStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={currentRSVP === status ? 'default' : 'outline'}
                  size="lg"
                  className="flex-1"
                  onClick={() => handleRSVP(status)}
                >
                  {status === 'going' && <CheckCircle className="mr-2 h-5 w-5" />}
                  {status === 'maybe' && <HelpCircle className="mr-2 h-5 w-5" />}
                  {status === 'not_going' && <XCircle className="mr-2 h-5 w-5" />}
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>
            {currentRSVP && (
              <p className="text-sm text-accent font-medium mt-2">
                Your response: {currentRSVP.charAt(0).toUpperCase() + currentRSVP.slice(1).replace('_', ' ')}
              </p>
            )}
          </div>
          
          <div className="w-full space-y-3 pt-4 border-t border-border">
            <h3 className="text-xl font-semibold text-foreground flex items-center justify-center">
              <Link2 className="mr-2 h-5 w-5 text-primary" /> Share this Event
            </h3>
            <div className="flex items-center space-x-2">
              <Input type="text" value={eventUrl} readOnly className="bg-background/70" aria-label="Event Link" />
              <Button onClick={handleCopyLink} variant="outline" size="icon" aria-label="Copy event link">
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="text-center mt-8">
        <Button variant="link" asChild>
            <Link href="/">Back to EventLink Home</Link>
        </Button>
      </div>
    </div>
  );
}


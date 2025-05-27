
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event, RSVPStatus } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, MapPin, ExternalLink, Tag, CheckCircle, HelpCircle, XCircle, MessageSquare, Link2, Copy, User, AtSign, Phone } from 'lucide-react';
import NextImage from 'next/image';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, saveRSVP, incrementEventView } = useEventStorage();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [currentRSVPStatusForSession, setCurrentRSVPStatusForSession] = useState<RSVPStatus | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [eventUrl, setEventUrl] = useState<string>('');
  const [viewIncremented, setViewIncremented] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);

  const eventId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEventUrl(window.location.href);
    }

    async function fetchEvent() {
      if (eventId && !authIsLoading) {
        setIsLoadingEvent(true);
        const foundEvent = await getEventById(eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          if (foundEvent.images && foundEvent.images.length > 0) {
            setSelectedImage(foundEvent.images[0]);
          }
          if (!viewIncremented) {
            await incrementEventView(eventId);
            setViewIncremented(true);
          }
          if (isAuthenticated && user && foundEvent.userId === user.id) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        } else {
          setEvent(null);
          setIsOwner(false);
          // Optionally show a toast if event not found from DB
           toast({
            title: "Event Not Found",
            description: "The event details could not be loaded from the database. It might have been removed or the link is incorrect.",
            variant: "destructive",
          });
        }
        setIsLoadingEvent(false);
      } else if (!eventId) {
        setIsLoadingEvent(false);
        setIsOwner(false);
      }
    }

    fetchEvent();
  }, [eventId, getEventById, authIsLoading, isAuthenticated, user, incrementEventView, viewIncremented, toast]);


  const handleRSVP = async (status: RSVPStatus) => {
    if (!event || isSubmittingRSVP) return;

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
      if (!rsvpEmail.trim() || !/^\S+@\S+\.\S+$/.test(rsvpEmail.trim())) {
        toast({ title: "Valid Email Required", description: "Please enter a valid email address to RSVP.", variant: "destructive" });
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

    setIsSubmittingRSVP(true);
    try {
      await saveRSVP(event.id, status, details);
      setCurrentRSVPStatusForSession(status); 
      toast({
        title: "RSVP Submitted!",
        description: `You responded: ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
      });
      if (isOwner) {
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) setEvent(updatedEvent);
      }
      setRsvpName('');
      setRsvpEmail('');
      setRsvpPhone('');
    } catch (error) {
      console.error("Failed to save RSVP:", error);
      toast({ title: "RSVP Failed", description: "Could not submit your RSVP. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingRSVP(false);
    }
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

  const cs = event?.customStyles; 
  const defaultIconColor = 'var(--primary)'; 
  const defaultTextColor = 'var(--foreground)'; 
  const defaultCardBg = 'var(--card)'; 
  const defaultButtonBg = cs?.buttonBackgroundColor || 'var(--primary)';
  const defaultButtonText = cs?.buttonTextColor || 'var(--primary-foreground)';


  if (isLoadingEvent || authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin" style={{color: cs?.iconAndTitleColor || defaultIconColor }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg" style={{color: cs?.textColor || defaultTextColor}}>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen py-8">
        <Card className="w-full max-w-md text-center shadow-xl" style={{backgroundColor: defaultCardBg, color: defaultTextColor}}>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p >
              The event details could not be loaded. This might be because the link is incorrect,
              the event has been removed, or there was an issue fetching the data from the server.
            </p>
            <p className="text-sm mt-2">
               If you followed a shared link, please verify it with the event creator.
            </p>
          </CardContent>
          <CardFooter>
             <Button asChild className="w-full">
                <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  let formattedDate = "Date not available";
  try {
    if (event.date) {
      // Ensure date string is treated as UTC to avoid off-by-one day errors
      const [year, month, day] = event.date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      if (!isNaN(dateObj.getTime())) { 
         formattedDate = format(dateObj, "EEEE, MMMM dd, yyyy");
      }
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }


  return (
    <div className={`max-w-4xl mx-auto ${isOwner ? '' : 'py-8'}`}> 
      <Card 
        className="overflow-hidden shadow-2xl"
        style={{
          backgroundColor: cs?.contentBackgroundColor || defaultCardBg,
          color: cs?.textColor || defaultTextColor,
        }}
      >
        {selectedImage && (
          <div className="relative w-full h-64 md:h-96 bg-muted">
            <NextImage
              src={selectedImage}
              alt={event.name}
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
              style={{ objectFit: "cover" }} 
              className="transition-opacity duration-300 ease-in-out"
              data-ai-hint="event highlight"
              priority={true} 
            />
          </div>
        )}
        {event.images && event.images.length > 1 && (
          <div className="p-4 bg-black/5 flex gap-2 overflow-x-auto">
            {event.images.map((imgUrl, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedImage(imgUrl)} 
                className={cn(
                  "h-16 w-16 rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2",
                  selectedImage === imgUrl ? "border-primary ring-primary" : "border-transparent hover:border-primary/50 ring-transparent"
                )}
                style={{borderColor: selectedImage === imgUrl ? (cs?.iconAndTitleColor || defaultIconColor) : 'transparent',
                        ringColor: selectedImage === imgUrl ? (cs?.iconAndTitleColor || defaultIconColor) : 'transparent'
                       }}
              >
                <NextImage 
                    src={imgUrl} 
                    alt={`${event.name} thumbnail ${idx+1}`} 
                    width={64} 
                    height={64} 
                    style={{ objectFit: "cover" }}
                    data-ai-hint="event photo" 
                />
              </button>
            ))}
          </div>
        )}

        <CardHeader className="text-center border-b pb-6">
          <CardTitle 
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{
              color: cs?.iconAndTitleColor || defaultIconColor,
              fontFamily: cs?.fontEventName || 'inherit',
            }}
          >
            {event.name}
          </CardTitle>
          <CardDescription 
            className="text-lg mt-2"
            style={{
              color: cs?.textColor || 'var(--muted-foreground)',
              fontFamily: cs?.fontDescription || 'inherit',
            }}
          >
            You're invited! Join us for this special occasion.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8 px-6 md:px-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div className="flex items-start">
              <CalendarDays className="h-8 w-8 mr-4 mt-1 flex-shrink-0" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/>
              <div>
                <h3 className="font-semibold" style={{fontFamily: cs?.fontTitles || 'inherit'}}>Date</h3>
                <p style={{color: cs?.textColor || 'var(--muted-foreground)', fontFamily: cs?.fontDescription || 'inherit'}}>{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-8 w-8 mr-4 mt-1 flex-shrink-0" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/>
              <div>
                <h3 className="font-semibold" style={{fontFamily: cs?.fontTitles || 'inherit'}}>Time</h3>
                <p style={{color: cs?.textColor || 'var(--muted-foreground)', fontFamily: cs?.fontDescription || 'inherit'}}>{event.time}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start text-lg">
            <MapPin className="h-8 w-8 mr-4 mt-1 flex-shrink-0" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/>
            <div>
              <h3 className="font-semibold" style={{fontFamily: cs?.fontTitles || 'inherit'}}>Location</h3>
              <p style={{color: cs?.textColor || 'var(--muted-foreground)', fontFamily: cs?.fontDescription || 'inherit'}}>{event.location}</p>
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm hover:underline mt-1"
                  style={{color: cs?.iconAndTitleColor || 'var(--accent)', fontFamily: cs?.fontDescription || 'inherit'}}
                >
                  View Map <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center" style={{fontFamily: cs?.fontTitles || 'inherit'}}>
                <MessageSquare className="h-6 w-6 mr-3" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> About the Event
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed" style={{color: cs?.textColor || 'var(--muted-foreground)', fontFamily: cs?.fontDescription || 'inherit'}}>{event.description}</p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center" style={{fontFamily: cs?.fontTitles || 'inherit'}}>
                <Tag className="h-6 w-6 mr-3" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm" style={{fontFamily: cs?.fontDescription || 'inherit'}}>{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter 
            className="p-6 md:p-8 border-t flex-col space-y-6"
            style={{backgroundColor: cs?.contentBackgroundColor ? `${cs.contentBackgroundColor}99` : 'var(--muted-background / 0.5)'}} 
        >
          <div className="w-full space-y-4 text-center">
            <h3 className="text-2xl font-semibold mb-4" style={{color: cs?.textColor || defaultTextColor, fontFamily: cs?.fontTitles || 'inherit'}}>Will you attend?</h3>

            {(event.rsvpCollectFields.name || event.rsvpCollectFields.email || event.rsvpCollectFields.phone) && (
              <div className="space-y-4 mb-6 max-w-md mx-auto text-left">
                {event.rsvpCollectFields.name && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-name" className="flex items-center text-sm font-medium" style={{color: cs?.textColor || defaultTextColor, fontFamily: cs?.fontTitles || 'inherit'}}>
                      <User className="mr-2 h-4 w-4" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> Name
                    </Label>
                    <Input id="rsvp-name" type="text" placeholder="Your Name" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} className="bg-background/70" required disabled={isSubmittingRSVP} style={{fontFamily: cs?.fontDescription || 'inherit'}}/>
                  </div>
                )}
                {event.rsvpCollectFields.email && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-email" className="flex items-center text-sm font-medium" style={{color: cs?.textColor || defaultTextColor, fontFamily: cs?.fontTitles || 'inherit'}}>
                      <AtSign className="mr-2 h-4 w-4" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> Email
                    </Label>
                    <Input id="rsvp-email" type="email" placeholder="your.email@example.com" value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} className="bg-background/70" required disabled={isSubmittingRSVP} style={{fontFamily: cs?.fontDescription || 'inherit'}}/>
                  </div>
                )}
                {event.rsvpCollectFields.phone && (
                  <div className="space-y-1">
                    <Label htmlFor="rsvp-phone" className="flex items-center text-sm font-medium" style={{color: cs?.textColor || defaultTextColor, fontFamily: cs?.fontTitles || 'inherit'}}>
                      <Phone className="mr-2 h-4 w-4" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> Phone Number
                    </Label>
                    <Input id="rsvp-phone" type="tel" placeholder="Your Phone Number" value={rsvpPhone} onChange={(e) => setRsvpPhone(e.target.value)} className="bg-background/70" required disabled={isSubmittingRSVP} style={{fontFamily: cs?.fontDescription || 'inherit'}}/>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {(['going', 'maybe', 'not_going'] as RSVPStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={currentRSVPStatusForSession === status ? 'default' : 'outline'}
                  size="lg"
                  className="flex-1"
                  onClick={() => handleRSVP(status)}
                  disabled={isSubmittingRSVP}
                  style={ currentRSVPStatusForSession === status ? 
                    { backgroundColor: cs?.buttonBackgroundColor || defaultButtonBg, color: cs?.buttonTextColor || defaultButtonText, fontFamily: cs?.fontTitles || 'inherit', borderColor: cs?.buttonBackgroundColor || defaultButtonBg } : 
                    { borderColor: cs?.buttonBackgroundColor || defaultButtonBg, color: cs?.buttonBackgroundColor || defaultButtonBg, fontFamily: cs?.fontTitles || 'inherit'}
                  }
                >
                  {isSubmittingRSVP && currentRSVPStatusForSession === status ? 'Submitting...' : ''}
                  {status === 'going' && <CheckCircle className="mr-2 h-5 w-5" />}
                  {status === 'maybe' && <HelpCircle className="mr-2 h-5 w-5" />}
                  {status === 'not_going' && <XCircle className="mr-2 h-5 w-5" />}
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>
            {currentRSVPStatusForSession && (
              <p className="text-sm font-medium mt-2" style={{color: cs?.iconAndTitleColor || 'var(--accent)', fontFamily: cs?.fontDescription || 'inherit'}}>
                Your response: {currentRSVPStatusForSession.charAt(0).toUpperCase() + currentRSVPStatusForSession.slice(1).replace('_', ' ')}
              </p>
            )}
          </div>
          
          {(event.allowEventSharing || isOwner) && (
            <div className="w-full space-y-3 pt-4 border-t border-border">
              <h3 className="text-xl font-semibold flex items-center justify-center" style={{color: cs?.textColor || defaultTextColor, fontFamily: cs?.fontTitles || 'inherit'}}>
                <Link2 className="mr-2 h-5 w-5" style={{color: cs?.iconAndTitleColor || defaultIconColor}}/> Share this Event
              </h3>
              <div className="flex items-center space-x-2">
                <Input type="text" value={eventUrl} readOnly className="bg-background/70" aria-label="Event Link" style={{fontFamily: cs?.fontDescription || 'inherit'}}/>
                <Button onClick={handleCopyLink} variant="outline" size="icon" aria-label="Copy event link" 
                  style={{
                      borderColor: cs?.buttonBackgroundColor || defaultButtonBg, 
                      color: cs?.buttonBackgroundColor || defaultButtonBg
                  }}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      {!isOwner && (
        <div className="text-center mt-8">
            <Button variant="link" asChild style={{color: cs?.iconAndTitleColor || defaultIconColor, fontFamily: cs?.fontTitles || 'inherit'}}>
                <Link href="/">Back to EventLink Home</Link>
            </Button>
        </div>
      )}
    </div>
  );
}

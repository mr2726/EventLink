
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event, Attendee } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Eye, CheckCircle, HelpCircle, XCircle, Users, User, AtSign, Phone, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // Keep format for submittedAt
import { useAuth } from '@/contexts/AuthContext';

export default function EventStatsPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById } = useEventStorage();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const eventId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    async function fetchEventDetails() {
      if (eventId && !authIsLoading) {
        setIsLoadingEvent(true);
        const foundEvent = await getEventById(eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          if (isAuthenticated && user && foundEvent.userId === user.id) {
            setIsOwner(true);
          } else {
            // If not authenticated or not the owner, redirect.
            // This page should be owner-only.
            toast({ title: "Access Denied", description: "You do not have permission to view these statistics.", variant: "destructive" });
            router.push(`/event/${eventId}`); // or router.push('/');
            setIsOwner(false);
          }
        } else {
          // Event not found
          toast({ title: "Event Not Found", description: "The event statistics could not be loaded.", variant: "destructive" });
          router.push('/');
        }
        setIsLoadingEvent(false);
      } else if (!eventId) {
         setIsLoadingEvent(false);
      }
    }
    fetchEventDetails();
  }, [eventId, getEventById, authIsLoading, isAuthenticated, user, router]);


  if (isLoadingEvent || authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">Loading event statistics...</p>
        </div>
      </div>
    );
  }

  if (!event || !isOwner) {
     // This case should ideally be handled by the redirect in useEffect,
     // but as a fallback:
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
         <p className="text-lg text-destructive">Access denied or event not found.</p>
      </div>
    );
  }
  
  // Ensure rsvpCounts exists
  const rsvpCounts = event.rsvpCounts || { going: 0, maybe: 0, not_going: 0 };

  const rsvpData = [
    { status: 'Going', count: rsvpCounts.going, icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    { status: 'Maybe', count: rsvpCounts.maybe, icon: <HelpCircle className="h-5 w-5 text-yellow-500" /> },
    { status: 'Not Going', count: rsvpCounts.not_going, icon: <XCircle className="h-5 w-5 text-red-500" /> },
  ];

  const totalRSVPs = event.attendees ? event.attendees.length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl text-primary flex items-center">
              <BarChart3 className="mr-3 h-8 w-8" />
              Statistics for: {event.name}
            </CardTitle>
          </div>
          <CardDescription>Overview of engagement for your event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-accent" /> Page Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-foreground">{event.views || 0}</p>
                <p className="text-sm text-muted-foreground">Total times the event page has been visited.</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="mr-2 h-5 w-5 text-accent" /> RSVP Summary
                </CardTitle>
                <CardDescription>Total Responses: {totalRSVPs}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvpData.map((item) => (
                      <TableRow key={item.status}>
                        <TableCell className="font-medium flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.status}</span>
                        </TableCell>
                        <TableCell className="text-right text-lg font-semibold">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {event.attendees && event.attendees.length > 0 && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="mr-2 h-5 w-5 text-accent" /> Attendee Details
                </CardTitle>
                <CardDescription>List of guests who have RSVP'd.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {event.rsvpCollectFields?.name && <TableHead><User className="inline mr-1 h-4 w-4"/>Name</TableHead>}
                      {event.rsvpCollectFields?.email && <TableHead><AtSign className="inline mr-1 h-4 w-4"/>Email</TableHead>}
                      {event.rsvpCollectFields?.phone && <TableHead><Phone className="inline mr-1 h-4 w-4"/>Phone</TableHead>}
                      <TableHead>RSVP Status</TableHead>
                      <TableHead className="text-right"><CalendarClock className="inline mr-1 h-4 w-4"/>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.attendees.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((attendee: Attendee, index: number) => (
                      <TableRow key={attendee.id || index}> {/* Use index as fallback key if id isn't guaranteed */}
                        {event.rsvpCollectFields?.name && <TableCell>{attendee.name || 'N/A'}</TableCell>}
                        {event.rsvpCollectFields?.email && <TableCell>{attendee.email || 'N/A'}</TableCell>}
                        {event.rsvpCollectFields?.phone && <TableCell>{attendee.phone || 'N/A'}</TableCell>}
                        <TableCell>
                          <Badge variant={
                            attendee.status === 'going' ? 'default' :
                            attendee.status === 'maybe' ? 'secondary' :
                            'destructive'
                          } className="capitalize">
                            {attendee.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {attendee.submittedAt ? format(new Date(attendee.submittedAt), "PPpp") : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
           {(!event.attendees || event.attendees.length === 0) && (
             <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                    <Users className="mr-2 h-5 w-5 text-accent" /> Attendee Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No attendees have RSVP'd yet.</p>
                </CardContent>
             </Card>
           )}
        </CardContent>
        <CardFooter className="flex justify-center print:hidden">
          <Button asChild variant="default">
            <Link href={`/event/${event.id}`}>View Event Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

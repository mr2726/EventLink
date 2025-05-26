
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Eye, CheckCircle, HelpCircle, XCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EventStatsPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, isInitialized } = useEventStorage();
  const [event, setEvent] = useState<Event | null>(null);

  const eventId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (isInitialized && eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        // Optionally, redirect or show a "not found" message
        router.push('/');
      }
    }
  }, [eventId, getEventById, isInitialized, router]);

  if (!isInitialized || !event) {
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

  const rsvpData = [
    { status: 'Going', count: event.rsvpCounts.going, icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    { status: 'Maybe', count: event.rsvpCounts.maybe, icon: <HelpCircle className="h-5 w-5 text-yellow-500" /> },
    { status: 'Not Going', count: event.rsvpCounts.not_going, icon: <XCircle className="h-5 w-5 text-red-500" /> },
  ];

  const totalRSVPs = event.rsvpCounts.going + event.rsvpCounts.maybe + event.rsvpCounts.not_going;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
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
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Eye className="mr-2 h-5 w-5 text-accent" /> Page Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{event.views}</p>
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
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="default">
            <Link href={`/event/${event.id}`}>View Event Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

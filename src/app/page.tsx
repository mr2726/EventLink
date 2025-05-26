"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event } from '@/lib/types';
import { CalendarDays, Clock, MapPin, Tag, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function HomePage() {
  const { events, isInitialized } = useEventStorage();

  const recentEvents = events.slice(-3).reverse(); // Show latest 3 events

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/20 via-background to-accent/20 rounded-xl shadow-lg">
        <PartyPopper className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-6">
          Welcome to EventLink!
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
          Create beautiful, personalized invitation pages for your weddings, birthdays, parties, meetups, and more. Share your special moments effortlessly.
        </p>
        <Button size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/create">Create Your Event Invitation</Link>
        </Button>
      </section>

      {isInitialized && events.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold text-center mb-8 text-primary">Recent Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents.map((event) => (
              <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {event.images && event.images[0] && (
                  <div className="relative w-full h-48">
                    <Image
                      src={event.images[0]}
                      alt={event.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="event celebration"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-primary truncate">{event.name}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4" /> {format(new Date(event.date), "MMMM dd, yyyy")}
                    <Clock className="ml-4 mr-2 h-4 w-4" /> {event.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{event.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  {event.tags.length > 0 && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.tags.slice(0,3).join(', ')}</span>
                     </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/event/${event.id}`}>View Invitation</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
       {isInitialized && events.length === 0 && (
        <section className="text-center py-10">
            <p className="text-lg text-muted-foreground">No events created yet. Be the first to create one!</p>
        </section>
      )}
    </div>
  );
}


"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStorage } from '@/hooks/useEventStorage';
import type { Event } from '@/lib/types';
import { CalendarDays, Clock, MapPin, Tag, PartyPopper, BarChart3, Eye } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import LandingPage from '@/components/LandingPage'; // Import the new LandingPage component
import { useState } from 'react'; // Import useState

export default function HomePage() {
  const { events: allEvents, isInitialized: eventsAreInitialized } = useEventStorage();
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false); // New state for controlling AuthForm visibility

  const userEvents = isAuthenticated && user 
    ? allEvents.filter(event => event.userId === user.id) 
    : [];

  const recentEvents = userEvents.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  if (authIsLoading || !eventsAreInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAuthForm) {
      return <AuthForm />;
    }
    return <LandingPage onGetStarted={() => setShowAuthForm(true)} />;
  }

  // Authenticated user view
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/20 via-background to-accent/20 rounded-xl shadow-lg">
        <PartyPopper className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-6">
          Welcome to EventLink, {user?.username}!
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
          Create beautiful, personalized invitation pages for your weddings, birthdays, parties, meetups, and more. Share your special moments effortlessly.
        </p>
        <Button size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/create">Create Your Event Invitation</Link>
        </Button>
      </section>

      {eventsAreInitialized && recentEvents.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold text-center mb-8 text-primary">Your Events</h2>
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
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                   <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Eye className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{event.views || 0} views</span>
                  </div>
                  {event.tags.length > 0 && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.tags.slice(0,3).join(', ')}</span>
                     </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" className="w-full sm:flex-1">
                    <Link href={`/event/${event.id}`}>View Invitation</Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full sm:flex-1">
                    <Link href={`/event/${event.id}/stats`}>
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        Stats
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
       {eventsAreInitialized && recentEvents.length === 0 && isAuthenticated && (
        <section className="text-center py-10">
            <p className="text-lg text-muted-foreground">You haven't created any events yet. Get started by clicking the button above!</p>
        </section>
      )}
    </div>
  );
}

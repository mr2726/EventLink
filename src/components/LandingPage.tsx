
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PartyPopper, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-3xl shadow-2xl overflow-hidden">
        <div className="relative w-full h-64 sm:h-80 md:h-96">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Event collage" 
            layout="fill" 
            objectFit="cover" 
            priority
            data-ai-hint="event collage celebration"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary-foreground mb-3">
              EventLink
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90">
              Your Moments, Beautifully Shared.
            </p>
          </div>
        </div>

        <CardContent className="p-6 md:p-10 text-center space-y-8">
          <div className="flex justify-center">
            <PartyPopper className="h-16 w-16 text-primary" />
          </div>
          <p className="text-xl md:text-2xl text-foreground/90 max-w-xl mx-auto">
            Effortlessly create and share stunning, personalized invitation pages for all your special occasions. From weddings and birthdays to corporate events and casual meetups, EventLink helps you connect with your guests in style.
          </p>
          
          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
            >
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-primary mb-2 text-lg">Easy Creation</h3>
              <p className="text-sm text-muted-foreground">Intuitive form to build your event page in minutes. No coding required!</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-primary mb-2 text-lg">Shareable Links</h3>
              <p className="text-sm text-muted-foreground">Get a unique link for each event, making invitations a breeze.</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-primary mb-2 text-lg">Track RSVPs</h3>
              <p className="text-sm text-muted-foreground">See who's coming and get detailed attendance statistics.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


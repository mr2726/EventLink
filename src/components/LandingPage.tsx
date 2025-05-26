
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Zap, Sparkles, Share2, Star, Mail, Settings, CalendarPlus, Users, Check, HelpCircle, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const testimonialsData = [
  {
    quote: "EventLink made planning my wedding invitations a breeze! So easy to use and the designs are beautiful.",
    name: "Sarah L.",
    role: "Happy Bride"
  },
  {
    quote: "Our corporate event page looked incredibly professional. Tracking RSVPs was simpler than ever.",
    name: "John B.",
    role: "Event Manager, TechCorp"
  },
  {
    quote: "I love how quickly I can whip up an invitation for a casual get-together. Highly recommended!",
    name: "Mike P.",
    role: "Party Enthusiast"
  },
  {
    quote: "The AI tag suggestions saved me so much time. My event was perfectly categorized!",
    name: "Jessica T.",
    role: "Community Organizer"
  },
  {
    quote: "Finally, an event platform that's both powerful and user-friendly. EventLink is a game-changer.",
    name: "David K.",
    role: "Startup Founder"
  }
];

const faqs = [
  {
    question: "What is EventLink?",
    answer: "EventLink is a platform that allows you to effortlessly create, customize, and share beautiful digital event invitations. Manage RSVPs, share event details, and connect with your guests all in one place."
  },
  {
    question: "How do I create an event?",
    answer: "Once you sign up and log in, simply click the 'Create Event' button. You'll be guided through a simple form to input all your event details, choose a template, and customize your page."
  },
  {
    question: "Is EventLink free to use?",
    answer: "EventLink offers a generous free tier for creating and managing your events. We may introduce premium features in the future, but core functionality will remain accessible."
  },
  {
    question: "Can I customize the look of my invitation?",
    answer: "Yes! EventLink provides various templates and customization options, including adding images, tags, and map links to make your invitation unique to your event."
  },
  {
    question: "How does the AI tag suggestion work?",
    answer: "Our AI analyzes your event's name, description, date, and location to suggest relevant tags, helping you categorize and organize your events more effectively."
  }
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const duplicatedTestimonials = [...testimonialsData, ...testimonialsData];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let scrollAmount = 0;
    const scrollSpeed = 0.5; 

    const animateScroll = () => {
      scrollAmount += scrollSpeed;
      if (container.scrollWidth > 0 && scrollAmount >= container.scrollWidth / 2) {
        scrollAmount = 0; 
      }
      container.scrollLeft = scrollAmount;
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);


  return (
    <div className="flex flex-col items-center w-full bg-background text-foreground">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left Column: Text Content */}
            <div className="md:w-1/2 text-center md:text-left space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-primary drop-shadow-lg">
                EventLink
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Craft Beautiful Invitations. Share Your Moments. Effortlessly.
              </p>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-shadow transform hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started Now <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>

            {/* Right Column: Custom Illustration */}
            <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center">
              <div className="relative w-full max-w-lg aspect-[4/3] p-4">
                {/* Central UI Mockup */}
                <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full h-full p-4 overflow-hidden flex flex-col items-center justify-center">
                  {/* Mockup Header */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-muted/70 flex items-center px-3 rounded-t-xl">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-1.5"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1.5"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  {/* Mockup Content Area */}
                  <div className="w-5/6 mt-8 space-y-3">
                    {/* Event Title Placeholder */}
                    <div className="h-10 bg-primary/20 rounded-md animate-pulse flex items-center justify-center">
                       <div className="w-3/4 h-4 bg-primary/40 rounded-sm"></div>
                    </div>
                    {/* Image Placeholder */}
                    <div className="aspect-video bg-accent/20 rounded-lg animate-pulse flex items-center justify-center text-accent/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                     {/* RSVP Question Placeholder */}
                    <div className="h-4 w-1/2 bg-muted/50 rounded-sm mx-auto animate-pulse mb-1"></div> {/* "Will you attend?" */}
                    {/* RSVP Buttons Placeholder */}
                    <div className="flex justify-around space-x-2 mt-1">
                        <div className="h-8 w-1/3 bg-secondary/30 rounded-md animate-pulse flex items-center justify-center text-secondary-foreground/50">
                            <Check className="h-4 w-4 mr-1"/> <span className="text-xs">Go</span>
                        </div>
                        <div className="h-8 w-1/3 bg-secondary/30 rounded-md animate-pulse flex items-center justify-center text-secondary-foreground/50">
                            <HelpCircle className="h-4 w-4 mr-1"/> <span className="text-xs">Maybe</span>
                        </div>
                        <div className="h-8 w-1/3 bg-secondary/30 rounded-md animate-pulse flex items-center justify-center text-secondary-foreground/50">
                            <X className="h-4 w-4 mr-1"/> <span className="text-xs">No</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Floating Decorative Elements */}
                <div 
                  className="absolute -top-8 -left-10 bg-primary/80 text-primary-foreground p-3 rounded-lg shadow-xl transform -rotate-12 hover:scale-110 transition-transform duration-300"
                  data-ai-hint="create event"
                >
                  <CalendarPlus className="h-8 w-8" />
                  <span className="mt-1 text-xs block font-medium">Create</span>
                </div>
                <div 
                  className="absolute -bottom-10 -right-12 bg-accent/80 text-accent-foreground p-4 rounded-full shadow-xl transform rotate-6 hover:scale-110 transition-transform duration-300"
                  data-ai-hint="share feature"
                >
                  <Share2 className="h-10 w-10" />
                  <span className="mt-1 text-xs block font-medium text-center">Share</span>
                </div>
                 <div 
                  className="absolute top-1/2 -translate-y-1/2 -right-16 bg-secondary/80 text-secondary-foreground p-3 rounded-lg shadow-xl transform rotate-[20deg] hover:scale-110 transition-transform duration-300"
                  data-ai-hint="manage attendees"
                >
                  <Users className="h-8 w-8" />
                  <span className="mt-1 text-xs block font-medium">Track</span>
                </div>
                <div 
                    className="absolute top-1/4 left-[-4rem] bg-destructive/10 text-destructive p-2 rounded-full shadow-lg transform -rotate-[30deg] hover:scale-125 transition-transform duration-300 opacity-70"
                    aria-hidden="true"
                >
                    <Sparkles className="h-5 w-5"/>
                </div>
                 <div 
                    className="absolute bottom-1/4 right-[-3rem] bg-primary/10 text-primary p-2 rounded-full shadow-lg transform rotate-[30deg] hover:scale-125 transition-transform duration-300 opacity-70"
                    aria-hidden="true"
                >
                    <Settings className="h-6 w-6"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="w-full py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Why Choose EventLink?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 sm:mb-16">
            We provide the tools you need to make every event memorable and easy to manage.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Fast & Easy Setup", description: "Create stunning event pages in minutes with our intuitive builder. No coding required!", dataAiHint: "speed interface" },
              { icon: Sparkles, title: "Beautiful Designs", description: "Choose from modern templates and customize them to perfectly match your event's vibe.", dataAiHint: "elegant design" },
              { icon: Share2, title: "Share & Track RSVPs", description: "Effortlessly share invitations via unique links and monitor guest responses and engagement.", dataAiHint: "social sharing analytics" }
            ].map((item, index) => (
              <Card key={index} className="p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">
                  <item.icon className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground mb-2">{item.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{item.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-12 sm:mb-16">What Our Users Say</h2>
          <div 
            ref={scrollContainerRef} 
            className="flex overflow-x-auto space-x-6 pb-4 no-scrollbar"
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card key={index} className="min-w-[300px] sm:min-w-[350px] p-6 shadow-lg flex-shrink-0 flex flex-col">
                <CardContent className="p-0 flex flex-col flex-grow">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic flex-grow">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-accent">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-12 sm:mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-lg font-medium text-left hover:text-accent py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-0 text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground mb-8 sm:mb-12">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <form className="space-y-6 text-left" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const contactData = Object.fromEntries(formData.entries());
            console.log("Contact form submitted:", contactData);
            alert("Thank you for your message! (This is a demo, data not actually sent)");
            (e.target as HTMLFormElement).reset();
          }}>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1">Your Name</label>
              <Input id="contact-name" name="name" type="text" placeholder="John Doe" className="bg-card" required />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1">Your Email</label>
              <Input id="contact-email" name="email" type="email" placeholder="you@example.com" className="bg-card" required />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1">Message</label>
              <Textarea id="contact-message" name="message" rows={5} placeholder="Your question or feedback..." className="bg-card" required />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </div>
  );
}
    

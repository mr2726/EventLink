
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Zap, Sparkles, Share2, Star, Mail } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image'; // Import NextImage

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

            {/* Right Column: Image */}
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="relative w-full max-w-xl mx-auto aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="https://placehold.co/800x600.png"
                  alt="EventLink platform showcase"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="modern workspace teamwork"
                  priority
                />
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

    
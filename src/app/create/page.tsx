"use client";

import EventForm from '@/components/EventForm';
import type { Event } from '@/lib/types';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function CreateEventPage() {
  const { addEvent } = useEventStorage();
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateEvent = (eventData: Event) => {
    addEvent(eventData);
    toast({
      title: "Event Created!",
      description: `Your event "${eventData.name}" has been successfully created.`,
    });
    router.push(`/event/${eventData.id}`);
  };

  return (
    <div>
      <EventForm onSubmit={handleCreateEvent} />
    </div>
  );
}

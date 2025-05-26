"use client";

import type { Event } from '@/lib/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Sparkles, PlusCircle, MinusCircle, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { suggestEventTags } from '@/ai/flows/suggest-event-tags';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters." }),
  date: z.date({ required_error: "Event date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  location: z.string().min(3, { message: "Location is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  mapLink: z.string().url({ message: "Invalid URL for map link." }).optional().or(z.literal('')),
  images: z.array(z.object({ url: z.string().url({ message: "Invalid image URL." }) })).max(5, {message: "Maximum 5 images allowed."}),
  tags: z.array(z.string().min(1, {message: "Tag cannot be empty."})).max(10, {message: "Maximum 10 tags allowed."}),
  template: z.string().min(1, { message: "Template selection is required." }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onSubmit: (data: Event) => void;
}

export default function EventForm({ onSubmit }: EventFormProps) {
  const { toast } = useToast();
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState('');


  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      time: '12:00',
      location: '',
      description: '',
      mapLink: '',
      images: [{ url: '' }],
      tags: [],
      template: 'default',
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });
  
  const { fields: tagFields, append: appendTag, remove: removeTag, replace: replaceTags } = useFieldArray({
    control: form.control,
    name: "tags"
  });

  const handleAddTag = () => {
    if (currentTagInput.trim() !== "" && !form.getValues("tags").includes(currentTagInput.trim())) {
      if (tagFields.length < 10) {
        appendTag(currentTagInput.trim() as any); // Zod expects object, react-hook-form field array for string works with string.
        setCurrentTagInput('');
      } else {
        toast({ title: "Tag Limit", description: "Maximum 10 tags allowed.", variant: "destructive" });
      }
    }
  };


  const handleSuggestTags = async () => {
    const eventName = form.getValues("name");
    const eventDescription = form.getValues("description");
    const eventDate = form.getValues("date");
    const eventLocation = form.getValues("location");

    if (!eventName || !eventDescription || !eventDate || !eventLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in event name, description, date, and location to suggest tags.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggestingTags(true);
    try {
      const result = await suggestEventTags({
        eventName,
        eventDescription,
        eventDate: format(eventDate, "yyyy-MM-dd"),
        eventLocation,
      });
      if (result.tags) {
        const newTags = result.tags.slice(0, 10); // Limit to 10 tags
        replaceTags(newTags.map(tag => (tag as any))); // Zod expects object for field array items
        toast({
          title: "Tags Suggested!",
          description: `${newTags.length} tags have been added.`,
        });
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({
        title: "AI Error",
        description: "Could not suggest tags at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const processSubmit = (data: EventFormValues) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      images: data.images.map(img => img.url).filter(url => url.trim() !== ''), // Store only non-empty URLs
      tags: data.tags,
    };
    onSubmit(newEvent);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Create Your Event Invitation</CardTitle>
        <CardDescription>Fill in the details below to generate your unique event page.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Awesome Birthday Party" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Tell your guests about the event..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mapLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Map Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://maps.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image URLs */}
            <FormItem>
              <FormLabel>Images (Up to 5 URLs)</FormLabel>
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <FormControl>
                     <Input
                        {...form.register(`images.${index}.url`)}
                        placeholder={`Image URL ${index + 1}`}
                      />
                  </FormControl>
                  {imageFields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)} aria-label="Remove image">
                      <MinusCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
               {imageFields.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                </Button>
              )}
              <FormMessage>{form.formState.errors.images?.message || form.formState.errors.images?.[0]?.url?.message}</FormMessage>
            </FormItem>

            {/* Tags */}
            <FormItem>
              <FormLabel>Tags (Up to 10)</FormLabel>
              <div className="flex items-center gap-2 mb-2">
                <FormControl>
                  <Input 
                    placeholder="Add a tag (e.g., birthday)" 
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                  />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleAddTag}>Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tagFields.map((tag, index) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {/* @ts-ignore value exists */}
                    <span>{tag.value || tag}</span>
                    <button type="button" onClick={() => removeTag(index)} className="ml-1 focus:outline-none">
                      <MinusCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags}>
                <Sparkles className="mr-2 h-4 w-4" /> {isSuggestingTags ? 'Suggesting...' : 'Suggest Tags with AI'}
              </Button>
              <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
            </FormItem>


            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="funky">Funky</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose a visual style for your invitation page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

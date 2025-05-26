
"use client";

import type { Event, CustomEventStyles } from '@/lib/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Sparkles, PlusCircle, MinusCircle, Tag, User, AtSign, Phone, Share2, Palette, Type, Eye, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { suggestEventTags } from '@/ai/flows/suggest-event-tags';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input'; // Standard input for non-color fields

const PREDEFINED_FONTS = [
  { label: 'Default Theme Font', value: 'inherit' },
  { label: 'Arial (sans-serif)', value: 'Arial, sans-serif' },
  { label: 'Verdana (sans-serif)', value: 'Verdana, sans-serif' },
  { label: 'Georgia (serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman (serif)', value: 'Times New Roman, Times, serif' },
  { label: 'Courier New (monospace)', value: 'Courier New, monospace' },
  { label: 'Lucida Console (monospace)', value: 'Lucida Console, monospace' },
];

const customStylesSchema = z.object({
  pageBackgroundColor: z.string().optional(),
  contentBackgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  iconAndTitleColor: z.string().optional(),
  fontEventName: z.string().optional(),
  fontTitles: z.string().optional(),
  fontDescription: z.string().optional(),
}).optional();

const eventFormSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters." }),
  date: z.date({ required_error: "Event date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  location: z.string().min(3, { message: "Location is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  mapLink: z.string().url({ message: "Invalid URL for map link." }).optional().or(z.literal('')),
  images: z.array(z.object({ url: z.string().url({ message: "Invalid image URL." }) })).max(5, {message: "Maximum 5 images allowed."}),
  tags: z.array(z.string().min(1, {message: "Tag cannot be empty."})).max(10, {message: "Maximum 10 tags allowed."}),
  rsvpCollectFields: z.object({
    name: z.boolean().default(true),
    email: z.boolean().default(false),
    phone: z.boolean().default(false),
  }),
  allowEventSharing: z.boolean().default(true),
  customStyles: customStylesSchema,
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onSubmit: (data: Omit<Event, 'id' | 'attendees' | 'userId' | 'views' | 'rsvpCounts' | 'createdAt'>) => void;
}

export default function EventForm({ onSubmit }: EventFormProps) {
  const { toast } = useToast();
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: 'My Awesome Event',
      time: '12:00',
      location: '123 Main Street, Anytown',
      description: 'Join us for a fantastic time! This event will be full of fun, laughter, and great memories. We will have food, drinks, and entertainment for everyone. Don\'t miss out!',
      mapLink: '',
      images: [{ url: 'https://placehold.co/600x400.png' }],
      tags: ['party', 'fun'],
      rsvpCollectFields: {
        name: true,
        email: false,
        phone: false,
      },
      allowEventSharing: true,
      customStyles: {
        pageBackgroundColor: '#F8F9FA', 
        contentBackgroundColor: '#FFFFFF', 
        textColor: '#212529', 
        iconAndTitleColor: '#FF7F50', 
        fontEventName: 'inherit',
        fontTitles: 'inherit',
        fontDescription: 'inherit',
      },
    },
  });

  const watchedCustomStyles = form.watch('customStyles');
  const watchedEventName = form.watch('name');
  const watchedDescription = form.watch('description');
  const watchedDate = form.watch('date');
  const watchedTime = form.watch('time');


  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });
  
  const { fields: tagFields, append: appendTag, remove: removeTag, replace: replaceTags } = useFieldArray({
    control: form.control,
    name: "tags"
  });

  const handleAddTag = () => {
    const tagValue = currentTagInput.trim();
    if (tagValue !== "" && !form.getValues("tags").includes(tagValue)) {
      if (tagFields.length < 10) {
        appendTag(tagValue);
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
        const currentTags = form.getValues("tags");
        const uniqueNewTags = result.tags.filter(tag => !currentTags.includes(tag));
        const combinedTags = [...currentTags, ...uniqueNewTags].slice(0, 10);
        replaceTags(combinedTags.map(tag => tag));
        toast({
          title: "Tags Suggested!",
          description: `${result.tags.length > 0 ? 'New tags added if space available.' : 'No new tags suggested or tags already exist.'}`,
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
    const newEventData: Omit<Event, 'id' | 'attendees' | 'userId' | 'views' | 'rsvpCounts' | 'createdAt'> = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'), 
      images: data.images.map(img => img.url).filter(url => url && url.trim() !== ''),
      tags: data.tags,
      customStyles: data.customStyles,
    };
    onSubmit(newEventData);
  };
  
  const colorInputBaseClasses = "h-10 w-full rounded-md border border-input bg-background p-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="w-full shadow-2xl lg:sticky lg:top-24"> {/* Sticky form */}
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Create Your Event Invitation</CardTitle>
          <CardDescription>Fill in the details and customize the appearance of your event page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
              {/* Basic Event Details */}
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Event Name</FormLabel> <FormControl> <Input placeholder="e.g., My Awesome Birthday Party" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Event Date</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } initialFocus/> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="time" render={({ field }) => ( <FormItem> <FormLabel>Event Time</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              </div>
              <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g., 123 Main St, Anytown" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea rows={5} placeholder="Tell your guests about the event..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="mapLink" render={({ field }) => ( <FormItem> <FormLabel>Map Link (Optional)</FormLabel> <FormControl> <Input placeholder="e.g., https://maps.google.com/..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              
              {/* Images and Tags */}
              <FormItem> <FormLabel>Images (Up to 5 URLs, first one is primary)</FormLabel> {imageFields.map((item, index) => ( <div key={item.id} className="flex items-center gap-2 mb-2"> <FormControl> <Input {...form.register(`images.${index}.url`)} placeholder={`Image URL ${index + 1}${index === 0 ? ' (Primary)' : ''}`}/> </FormControl> {imageFields.length > 1 && ( <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)} aria-label="Remove image"> <MinusCircle className="h-5 w-5 text-destructive" /> </Button> )} </div> ))} {imageFields.length < 5 && ( <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: 'https://placehold.co/600x400.png' })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL </Button> )} <FormMessage>{form.formState.errors.images?.message || form.formState.errors.images?.root?.message}</FormMessage> </FormItem>
              <FormItem> <FormLabel>Tags (Up to 10)</FormLabel> <div className="flex items-center gap-2 mb-2"> <FormControl> <Input placeholder="Add a tag (e.g., birthday)" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}/> </FormControl> <Button type="button" variant="outline" onClick={handleAddTag}>Add Tag</Button> </div> <div className="flex flex-wrap gap-2 mb-2"> {tagFields.map((item, index) => ( <Badge key={item.id} variant="secondary" className="flex items-center gap-1"> <span>{form.getValues("tags")[index]}</span> <button type="button" onClick={() => removeTag(index)} className="ml-1 focus:outline-none"> <MinusCircle className="h-3 w-3" /> </button> </Badge> ))} </div> <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags}> <Sparkles className="mr-2 h-4 w-4" /> {isSuggestingTags ? 'Suggesting...' : 'Suggest Tags with AI'} </Button> <FormMessage>{form.formState.errors.tags?.message || form.formState.errors.tags?.root?.message}</FormMessage> </FormItem>

              {/* RSVP and Sharing Options */}
              <FormItem> <FormLabel>RSVP Information to Collect</FormLabel> <FormDescription>Select which details guests should provide when they RSVP.</FormDescription> <div className="space-y-3 pt-2"> <FormField control={form.control} name="rsvpCollectFields.name" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md shadow-sm hover:bg-muted/50"> <FormControl> <Checkbox checked={field.value} onCheckedChange={field.onChange}/> </FormControl> <FormLabel className="font-normal flex items-center cursor-pointer"> <User className="mr-2 h-5 w-5 text-primary" /> Collect Name </FormLabel> </FormItem> )}/> <FormField control={form.control} name="rsvpCollectFields.email" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md shadow-sm hover:bg-muted/50"> <FormControl> <Checkbox checked={field.value} onCheckedChange={field.onChange}/> </FormControl> <FormLabel className="font-normal flex items-center cursor-pointer"> <AtSign className="mr-2 h-5 w-5 text-primary" /> Collect Email Address </FormLabel> </FormItem> )}/> <FormField control={form.control} name="rsvpCollectFields.phone" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md shadow-sm hover:bg-muted/50"> <FormControl> <Checkbox checked={field.value} onCheckedChange={field.onChange}/> </FormControl> <FormLabel className="font-normal flex items-center cursor-pointer"> <Phone className="mr-2 h-5 w-5 text-primary" /> Collect Phone Number </FormLabel> </FormItem> )}/> </div> </FormItem>
              <FormField control={form.control} name="allowEventSharing" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md shadow-sm hover:bg-muted/50"> <FormControl> <Checkbox checked={field.value} onCheckedChange={field.onChange}/> </FormControl> <div className="space-y-0.5"> <FormLabel className="font-normal flex items-center cursor-pointer"> <Share2 className="mr-2 h-5 w-5 text-primary" /> Allow Event Sharing </FormLabel> <FormDescription> If checked, guests will see a "Share this Event" section on the invitation page. </FormDescription> </div> </FormItem> )}/>
              
              {/* Custom Styles Section */}
              <Separator />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Color Customization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="customStyles.pageBackgroundColor" render={({ field }) => ( <FormItem> <FormLabel>Page Background Color</FormLabel> <FormControl><input type="color" {...field} className={cn(colorInputBaseClasses)}/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="customStyles.contentBackgroundColor" render={({ field }) => ( <FormItem> <FormLabel>Content Card Background</FormLabel> <FormControl><input type="color" {...field} className={cn(colorInputBaseClasses)}/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="customStyles.textColor" render={({ field }) => ( <FormItem> <FormLabel>Main Text Color</FormLabel> <FormControl><input type="color" {...field} className={cn(colorInputBaseClasses)}/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="customStyles.iconAndTitleColor" render={({ field }) => ( <FormItem> <FormLabel>Icon & Event Title Color</FormLabel> <FormControl><input type="color" {...field} className={cn(colorInputBaseClasses)}/></FormControl> <FormMessage /> </FormItem> )}/>
              </div>
              
              <Separator />
              <div className="space-y-2">
                 <h3 className="text-xl font-semibold flex items-center"><Type className="mr-2 h-5 w-5 text-primary" />Font Customization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="customStyles.fontEventName" render={({ field }) => ( <FormItem> <FormLabel>Event Name Font</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger></FormControl> <SelectContent>{PREDEFINED_FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="customStyles.fontTitles" render={({ field }) => ( <FormItem> <FormLabel>Section Titles Font</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger></FormControl> <SelectContent>{PREDEFINED_FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="customStyles.fontDescription" render={({ field }) => ( <FormItem> <FormLabel>Description Font</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger></FormControl> <SelectContent>{PREDEFINED_FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
              </div>
              <Separator />

              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Live Preview Section */}
      <div className="w-full lg:sticky lg:top-24"> {/* Sticky preview */}
        <h3 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center"><Eye className="mr-2 h-6 w-6 text-primary" /> Live Preview</h3>
        <div 
          className="rounded-lg shadow-xl overflow-hidden border border-border p-4" 
          style={{ 
            backgroundColor: watchedCustomStyles?.pageBackgroundColor || '#F8F9FA',
            minHeight: '600px' // Ensure preview has some height
          }}
        >
          <div 
            className="max-w-md mx-auto rounded-lg shadow-lg p-6" 
            style={{ 
              backgroundColor: watchedCustomStyles?.contentBackgroundColor || '#FFFFFF',
              color: watchedCustomStyles?.textColor || '#212529',
            }}
          >
            {/* Preview Header */}
            <div className="text-center mb-4">
              <h1 
                className="text-3xl font-bold" 
                style={{ 
                  color: watchedCustomStyles?.iconAndTitleColor || '#FF7F50',
                  fontFamily: watchedCustomStyles?.fontEventName || 'inherit',
                }}
              >
                {watchedEventName || "Event Name Preview"}
              </h1>
              <p 
                className="text-sm mt-1"
                style={{fontFamily: watchedCustomStyles?.fontDescription || 'inherit'}}
              >
                You're invited!
              </p>
            </div>

            {/* Preview Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <CalendarDays 
                  className="h-5 w-5 mr-3 flex-shrink-0" 
                  style={{ color: watchedCustomStyles?.iconAndTitleColor || '#FF7F50' }} 
                />
                <div>
                  <h3 
                    className="font-semibold" 
                    style={{ fontFamily: watchedCustomStyles?.fontTitles || 'inherit' }}
                  >
                    Date & Time
                  </h3>
                  <p style={{fontFamily: watchedCustomStyles?.fontDescription || 'inherit'}}>
                    {watchedDate ? format(watchedDate, "PPP") : "Select a date"} at {watchedTime || "12:00"}
                  </p>
                </div>
              </div>
              <div>
                <h3 
                  className="font-semibold mb-1 flex items-center"
                  style={{ fontFamily: watchedCustomStyles?.fontTitles || 'inherit' }}
                >
                  <Tag className="h-5 w-5 mr-2" style={{ color: watchedCustomStyles?.iconAndTitleColor || '#FF7F50' }}/>
                  About
                </h3>
                <p 
                  className="text-sm whitespace-pre-wrap"
                  style={{fontFamily: watchedCustomStyles?.fontDescription || 'inherit'}}
                >
                  {watchedDescription || "Event description preview goes here..."}
                </p>
              </div>
            </div>
            
            {/* Preview RSVP Button Mock */}
            <div className="text-center mt-6">
                <h3 
                    className="font-semibold mb-2"
                    style={{ fontFamily: watchedCustomStyles?.fontTitles || 'inherit' }}
                >Will you attend?</h3>
                <Button 
                    variant="default" 
                    style={{ 
                        backgroundColor: watchedCustomStyles?.iconAndTitleColor || '#FF7F50', 
                        color: watchedCustomStyles?.contentBackgroundColor && watchedCustomStyles.iconAndTitleColor ? (parseInt(watchedCustomStyles.iconAndTitleColor.slice(1,3), 16) > 128 ? '#000000' : '#FFFFFF') : '#FFFFFF' // Basic contrast for button text
                    }}
                >
                    RSVP Now (Preview)
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    

    
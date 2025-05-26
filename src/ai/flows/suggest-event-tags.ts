// src/ai/flows/suggest-event-tags.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant tags for an event based on event details.
 *
 * - suggestEventTags - A function that takes event details as input and returns suggested tags.
 * - SuggestEventTagsInput - The input type for the suggestEventTags function.
 * - SuggestEventTagsOutput - The output type for the suggestEventTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventTagsInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventDescription: z.string().describe('A description of the event.'),
  eventDate: z.string().describe('The date of the event.'),
  eventLocation: z.string().describe('The location of the event.'),
});

export type SuggestEventTagsInput = z.infer<typeof SuggestEventTagsInputSchema>;

const SuggestEventTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the event.'),
});

export type SuggestEventTagsOutput = z.infer<typeof SuggestEventTagsOutputSchema>;

export async function suggestEventTags(input: SuggestEventTagsInput): Promise<SuggestEventTagsOutput> {
  return suggestEventTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventTagsPrompt',
  input: {schema: SuggestEventTagsInputSchema},
  output: {schema: SuggestEventTagsOutputSchema},
  prompt: `You are an event tag suggestion expert. Based on the event details provided, suggest relevant tags to categorize the event.

Event Name: {{{eventName}}}
Event Description: {{{eventDescription}}}
Event Date: {{{eventDate}}}
Event Location: {{{eventLocation}}}

Suggest at least 5 relevant tags.`,
});

const suggestEventTagsFlow = ai.defineFlow(
  {
    name: 'suggestEventTagsFlow',
    inputSchema: SuggestEventTagsInputSchema,
    outputSchema: SuggestEventTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

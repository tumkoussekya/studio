'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests a relevant icebreaker conversation starter.
 *
 * - suggestConversationStarter - A function that suggests a conversation starter based on the context.
 * - SuggestConversationStarterInput - The input type for the suggestConversationStarter function.
 * - SuggestConversationStarterOutput - The return type for the suggestConversationStarter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestConversationStarterInputSchema = z.object({
  userContext: z.string().describe('The context of the user, including their interests and current activity.'),
  otherUserContext: z.string().describe('The context of the other user, including their interests and current activity.'),
});
export type SuggestConversationStarterInput = z.infer<
  typeof SuggestConversationStarterInputSchema
>;

const SuggestConversationStarterOutputSchema = z.object({
  conversationStarter: z.string().describe('A suggestion for an icebreaker conversation starter.'),
});
export type SuggestConversationStarterOutput = z.infer<
  typeof SuggestConversationStarterOutputSchema
>;

export async function suggestConversationStarter(
  input: SuggestConversationStarterInput
): Promise<SuggestConversationStarterOutput> {
  return suggestConversationStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestConversationStarterPrompt',
  input: {schema: SuggestConversationStarterInputSchema},
  output: {schema: SuggestConversationStarterOutputSchema},
  prompt: `You are a helpful assistant that suggests icebreaker conversation starters.

  Given the context of two users, suggest a relevant and engaging icebreaker to help them start a conversation.

  User Context: {{{userContext}}}
  Other User Context: {{{otherUserContext}}}

  Suggestion:`,
});

const suggestConversationStarterFlow = ai.defineFlow(
  {
    name: 'suggestConversationStarterFlow',
    inputSchema: SuggestConversationStarterInputSchema,
    outputSchema: SuggestConversationStarterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

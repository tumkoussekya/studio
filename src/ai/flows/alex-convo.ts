'use server';

/**
 * @fileOverview A Genkit flow for having a conversation with the NPC "Alex".
 *
 * - chatWithAlex - A function that handles the conversation logic.
 * - ChatWithAlexInput - The input type for the chatWithAlex function.
 * - ChatWithAlexOutput - The return type for the chatWithAlex function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const ChatWithAlexInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  newMessage: z.string().describe('The new message from the user.'),
});
export type ChatWithAlexInput = z.infer<
  typeof ChatWithAlexInputSchema
>;

export const ChatWithAlexOutputSchema = z.object({
  response: z.string().describe('The response from Alex.'),
});
export type ChatWithAlexOutput = z.infer<
  typeof ChatWithAlexOutputSchema
>;

export async function chatWithAlex(
  input: ChatWithAlexInput
): Promise<ChatWithAlexOutput> {
  return chatWithAlexFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithAlexPrompt',
  input: {schema: ChatWithAlexInputSchema},
  output: {schema: ChatWithAlexOutputSchema},
  prompt: `You are Alex, a friendly and knowledgeable virtual assistant in Pixel Space. You are standing in the "Focus Zone" of the world.

  You are talking to a user who has just walked up to you. Be helpful, engaging, and slightly witty. Keep your responses concise.

  Here is the conversation history so far:
  {{#each history}}
  {{role}}: {{{content}}}
  {{/each}}

  Here is the user's new message:
  user: {{{newMessage}}}

  Your response:`,
});

const chatWithAlexFlow = ai.defineFlow(
  {
    name: 'chatWithAlexFlow',
    inputSchema: ChatWithAlexInputSchema,
    outputSchema: ChatWithAlexOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

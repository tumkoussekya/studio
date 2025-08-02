
'use server';

/**
 * @fileOverview A Genkit flow for summarizing a chat conversation.
 *
 * - summarizeChat - A function that takes a chat history and returns a summary.
 * - SummarizeChatInput - The input type for the summarizeChat function.
 * - SummarizeChatOutput - The return type for the summarizeChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChatMessageSchema = z.object({
    author: z.string().describe('The author of the message.'),
    text: z.string().describe('The content of the message.'),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const SummarizeChatInputSchema = z.object({
  messages: z.array(ChatMessageSchema).describe('The history of the conversation to summarize.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;


export const SummarizeChatOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the conversation.'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;


export async function summarizeChat(
  input: SummarizeChatInput
): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}


const prompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {schema: SummarizeChatInputSchema},
  output: {schema: SummarizeChatOutputSchema},
  prompt: `You are a helpful assistant that summarizes chat conversations.
  
  Analyze the following chat history and provide a concise summary of the key points, decisions, and action items.
  Present the summary in well-structured markdown format.

  Chat History:
  {{#each messages}}
  **{{author}}**: {{{text}}}
  {{/each}}
  `,
});

const summarizeChatFlow = ai.defineFlow(
  {
    name: 'summarizeChatFlow',
    inputSchema: SummarizeChatInputSchema,
    outputSchema: SummarizeChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

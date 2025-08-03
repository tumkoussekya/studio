
'use server';

/**
 * @fileOverview A Genkit flow for having a conversation with the NPC "Alex".
 *
 * - chatWithAlex - A function that handles the conversation logic.
 * - ChatWithAlexInput - The input type for the chatWithAlex function.
 * - ChatWithAlexOutput - The return type for the chatWithAlex function.
 */

import {ai} from '@/ai/genkit';
import { addTask, getTasks } from '@/ai/tools/kanban-tools';
import {z} from 'genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ChatWithAlexInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  newMessage: z.string().describe('The new message from the user.'),
});
export type ChatWithAlexInput = z.infer<
  typeof ChatWithAlexInputSchema
>;

const ChatWithAlexOutputSchema = z.object({
  response: z.string().describe('The response from Alex.'),
});
export type ChatWithAlexOutput = z.infer<
  typeof ChatWithAlexOutputSchema
>;

export async function chatWithAlex(
  input: ChatWithAlexInput
): Promise<ChatWithAlexOutput> {
  const prompt = ai.definePrompt({
    name: 'chatWithAlexPrompt',
    input: {schema: ChatWithAlexInputSchema},
    output: {schema: ChatWithAlexOutputSchema},
    tools: [addTask, getTasks],
    prompt: `You are Alex, a friendly and knowledgeable virtual assistant in SyncroSpace. You are standing in the "Focus Zone" of the world.

  You are talking to a user who has just walked up to you. Be helpful, engaging, and slightly witty. Keep your responses concise.

  If the user asks you to create a task, add something to their todo list, or a similar request, use the 'addTask' tool.
  Based on the user's request, infer the task content, the most appropriate column, and a priority level. For example, if a user says "I'm working on the design right now", the column should be 'In Progress'. If they mention something is urgent, the priority should be 'High'.

  If the user asks "What should I do next?" or a similar question, use the 'getTasks' tool to see the current tasks. Then, suggest a task from the "To Do" column. Prefer suggesting tasks with a 'High' priority.

  Here is the conversation history so far:
  {{#each history}}
  {{role}}: {{{content}}}
  {{/each}}

  Here is the user's new message:
  user: {{{newMessage}}}

  Your response:`,
  });

  const {output} = await prompt(input);
  return output!;
}

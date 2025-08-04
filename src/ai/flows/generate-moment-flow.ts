
'use server';

/**
 * @fileOverview A Genkit flow for generating an artistic "moment" from the virtual world.
 *
 * - generateMoment - A function that takes a text description and generates an image.
 * - GenerateMomentInput - The input type for the generateMoment function.
 * - GenerateMomentOutput - The return type for the generateMoment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateMomentInputSchema = z.object({
  prompt: z.string().describe('The description of the moment to generate.'),
});
export type GenerateMomentInput = z.infer<
  typeof GenerateMomentInputSchema
>;

const GenerateMomentOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateMomentOutput = z.infer<
  typeof GenerateMomentOutputSchema
>;

export async function generateMoment(
  input: GenerateMomentInput
): Promise<GenerateMomentOutput> {
  const {media} = await ai.generate({
    model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
    prompt: `A vibrant, detailed pixel art scene of the following moment in a virtual office: ${input.prompt}. The style should be cheerful, modern, and slightly retro.`,
    config: {
        responseModalities: ['IMAGE'],
    },
  });

  return { imageUrl: media!.url! };
}

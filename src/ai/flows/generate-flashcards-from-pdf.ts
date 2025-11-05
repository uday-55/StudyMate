'use server';
/**
 * @fileOverview A flashcard generation AI agent.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  pdfText: z
    .string()
    .describe('The text content extracted from the PDF document.'),
  topic: z.string().describe('The topic of the PDF content.'),
  numberOfFlashcards: z
    .number()
    .min(1)
    .max(20)
    .default(5)
    .describe('The number of flashcards to generate.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question for the flashcard.'),
      answer: z.string().describe('The answer to the question.'),
    })
  ).describe('An array of flashcards generated from the PDF content.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert educator specializing in creating effective flashcards for students.

  Based on the provided PDF content and topic, generate a set of flashcards (question/answer pairs) to help students study for exams.
  The number of flashcards to generate is: {{{numberOfFlashcards}}}.

  Topic: {{{topic}}}
  PDF Content: {{{pdfText}}}

  Ensure that the flashcards are clear, concise, and cover the key concepts from the material.
  Format the output as a JSON object with a "flashcards" key, where the value is an array of objects, and each object has a "question" and an "answer" field.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

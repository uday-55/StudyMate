
'use server';
/**
 * @fileOverview A quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  studyMaterial: z
    .string()
    .describe('The study material to generate the quiz from.'),
  numberOfQuestions: z
    .number()
    .default(5)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(z.object({
    question: z.string().describe("The question for the quiz item."),
    answer: z.string().describe("The answer for the quiz item."),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).describe("The difficulty of the question.")
  })).describe('The generated quiz.')
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator for students.

  You will generate a quiz from the provided study material.
  The quiz should have the number of questions specified in the input.
  The quiz questions should be categorized by difficulty (Easy, Medium, Hard).
  The quiz should be returned as a JSON object with a "quiz" key, which is an array of quiz items.

  Study Material: {{{studyMaterial}}}
  Number of Questions: {{{numberOfQuestions}}}
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

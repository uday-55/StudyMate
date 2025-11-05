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
  quiz: z.string().describe('The generated quiz in JSON format.'),
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
  The quiz should be returned in JSON format.

  Study Material: {{{studyMaterial}}}
  Number of Questions: {{{numberOfQuestions}}}

  Example Quiz format:
  {
    "quiz": [
      {
        "question": "Question 1",
        "answer": "Answer 1",
        "difficulty": "Easy"
      },
      {
        "question": "Question 2",
        "answer": "Answer 2",
        "difficulty": "Medium"
      },
      {
        "question": "Question 3",
        "answer": "Answer 3",
        "difficulty": "Hard"
      }
    ]
  }
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

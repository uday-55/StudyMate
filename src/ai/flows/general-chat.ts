
'use server';
/**
 * @fileOverview A general purpose AI chatbot.
 *
 * - generalChat - A function that handles the chatbot conversation.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).describe("The chat history."),
  message: z.string().describe('The user\'s message.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  message: z.string().describe('The chatbot\'s response.'),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalChatPrompt',
  input: {schema: GeneralChatInputSchema},
  output: {schema: GeneralChatOutputSchema},
  prompt: `You are a helpful AI assistant called StudyMate. 

  Your role is to assist students with their questions, provide explanations, summarize content, and offer motivation. Engage in a friendly and supportive conversation.

  Here is the chat history:
  {{#each history}}
  {{#if (this.role == 'user')}}
  User: {{{this.content}}}
  {{else}}
  StudyMate: {{{this.content}}}
  {{/if}}
  {{/each}}

  New user message: {{{message}}}
  
  Your response:`,
});

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

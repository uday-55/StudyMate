'use server';

/**
 * @fileOverview A flow that allows users to ask questions about the content of a PDF.
 *
 * - askPdfQuestion - A function that handles the question answering process for a given PDF.
 * - AskPdfQuestionInput - The input type for the askPdfQuestion function.
 * - AskPdfQuestionOutput - The return type for the askPdfQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskPdfQuestionInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.
    ),
  question: z.string().describe('The question to ask about the PDF content.'),
});

export type AskPdfQuestionInput = z.infer<typeof AskPdfQuestionInputSchema>;

const AskPdfQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the PDF content.'),
});

export type AskPdfQuestionOutput = z.infer<typeof AskPdfQuestionOutputSchema>;

export async function askPdfQuestion(input: AskPdfQuestionInput): Promise<AskPdfQuestionOutput> {
  return askPdfQuestionFlow(input);
}

const askPdfQuestionPrompt = ai.definePrompt({
  name: 'askPdfQuestionPrompt',
  input: {schema: AskPdfQuestionInputSchema},
  output: {schema: AskPdfQuestionOutputSchema},
  prompt: `You are an AI assistant designed to answer questions about PDF documents.  

  You will be given a PDF document and a question.  Your task is to answer the question based on the content of the PDF.  

  PDF Document: {{media url=pdfDataUri}}

  Question: {{{question}}}

  Answer: `,
});

const askPdfQuestionFlow = ai.defineFlow(
  {
    name: 'askPdfQuestionFlow',
    inputSchema: AskPdfQuestionInputSchema,
    outputSchema: AskPdfQuestionOutputSchema,
  },
  async input => {
    const {output} = await askPdfQuestionPrompt(input);
    return output!;
  }
);

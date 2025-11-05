'use server';
/**
 * @fileOverview An AI agent for generating summaries of PDFs or specific parts of them.
 *
 * - generateSummary - A function that handles the summary generation process.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  pdfText: z.string().describe('The text extracted from the PDF document.'),
  pageNumbers: z
    .string()
    .optional()
    .describe('Optional page numbers to summarize, if not provided will summarize entire PDF.'),
  summaryType: z.enum(['Quick Summary', 'Detailed Summary']).describe('The type of summary to generate.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the PDF content.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `You are an expert summarizer of PDF documents, able to distill the key information from large documents.

You will generate a summary of the PDF content, taking into account the specified summary type and optional page numbers.

{% if pageNumbers %}
You will summarize only the content from the following pages: {{pageNumbers}}.
{% endif %}

The summary type is: {{summaryType}}.

Use the following PDF text to generate the summary:

{{pdfText}}`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

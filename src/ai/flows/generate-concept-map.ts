
'use server';
/**
 * @fileOverview An AI agent for generating a concept map from text.
 *
 * - generateConceptMap - A function that handles the concept map generation process.
 * - GenerateConceptMapInput - The input type for the generateConceptMap function.
 * - GenerateConceptMapOutput - The return type for the generateConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConceptMapInputSchema = z.object({
  text: z
    .string()
    .describe('The text content to generate the concept map from.'),
});
export type GenerateConceptMapInput = z.infer<typeof GenerateConceptMapInputSchema>;

const NodeSchema = z.object({
  id: z.string().describe('A unique identifier for the concept node.'),
  label: z.string().describe('The name or title of the concept.'),
});

const EdgeSchema = z.object({
  from: z.string().describe('The ID of the source concept node.'),
  to: z.string().describe('The ID of the target concept node.'),
  label: z.string().describe('A description of the relationship between the two concepts.'),
});

const GenerateConceptMapOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe('A list of the main concepts identified in the text.'),
  edges: z.array(EdgeSchema).describe('A list of the relationships connecting the concepts.'),
});
export type GenerateConceptMapOutput = z.infer<typeof GenerateConceptMapOutputSchema>;

export async function generateConceptMap(input: GenerateConceptMapInput): Promise<GenerateConceptMapOutput> {
  return generateConceptMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConceptMapPrompt',
  input: {schema: GenerateConceptMapInputSchema},
  output: {schema: GenerateConceptMapOutputSchema},
  prompt: `You are an expert at creating concept maps from educational material.
  
  Your task is to analyze the following text and identify the key concepts and their relationships.
  
  1. Identify the main topics and sub-topics. These will be your 'nodes'. Each node must have a unique 'id' and a 'label'.
  2. Determine the connections between these concepts. These will be your 'edges'. Each edge must specify the 'from' and 'to' node IDs and have a 'label' describing the relationship (e.g., "is a type of", "leads to", "is composed of").
  3. Ensure the map is a connected graph, representing the core structure of the provided text.
  4. Format the output as a JSON object containing a 'nodes' array and an 'edges' array.

  Text to analyze:
  {{{text}}}
  `,
});

const generateConceptMapFlow = ai.defineFlow(
  {
    name: 'generateConceptMapFlow',
    inputSchema: GenerateConceptMapInputSchema,
    outputSchema: GenerateConceptMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

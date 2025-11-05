import { config } from 'dotenv';
config();

import '@/ai/flows/pdf-question-answering.ts';
import '@/ai/flows/auto-generate-quiz-from-content.ts';
import '@/ai/flows/generate-flashcards-from-pdf.ts';
import '@/ai/flows/generate-summary-from-pdf.ts';
import '@/ai/flows/text-to-speech.ts';


"use server";

import { z } from "zod";
import { askPdfQuestion } from "@/ai/flows/pdf-question-answering";
import { generateSummary } from "@/ai/flows/generate-summary-from-pdf";
import { generateFlashcards } from "@/ai/flows/generate-flashcards-from-pdf";
import { generateQuiz } from "@/ai/flows/auto-generate-quiz-from-content";
import pdf from "pdf-parse";

// Utility to read file from FormData
async function readFileFromFormData(formData: FormData, fieldName: string): Promise<{ buffer: Buffer, dataUri: string, fileName: string }> {
  const file = formData.get(fieldName) as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  return { buffer, dataUri, fileName: file.name };
}

// Q&A Action
const qaSchema = z.object({
  question: z.string().min(1, "Question is required."),
});
export async function handlePdfQuestion(prevState: any, formData: FormData) {
  try {
    const validatedFields = qaSchema.safeParse({
      question: formData.get("question"),
    });

    if (!validatedFields.success) {
      return { status: "error", message: "Invalid input." };
    }

    const { dataUri } = await readFileFromFormData(formData, "pdf");
    
    const result = await askPdfQuestion({
      pdfDataUri: dataUri,
      question: validatedFields.data.question,
    });

    return { status: "success", answer: result.answer };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

// Summary Action
const summarySchema = z.object({
  summaryType: z.enum(["Quick Summary", "Detailed Summary"]),
});
export async function handleGenerateSummary(prevState: any, formData: FormData) {
  try {
    const validatedFields = summarySchema.safeParse({
      summaryType: formData.get("summaryType"),
    });

    if (!validatedFields.success) {
      return { status: "error", message: "Invalid summary type." };
    }

    const { buffer } = await readFileFromFormData(formData, "pdf");
    const pdfData = await pdf(buffer);

    const result = await generateSummary({
      pdfText: pdfData.text,
      summaryType: validatedFields.data.summaryType,
    });

    return { status: "success", summary: result.summary };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

// Flashcards Action
const flashcardsSchema = z.object({
  topic: z.string().min(1, "Topic is required."),
  numberOfFlashcards: z.coerce.number().min(1).max(20),
});
export async function handleGenerateFlashcards(prevState: any, formData: FormData) {
    try {
    const validatedFields = flashcardsSchema.safeParse({
      topic: formData.get("topic"),
      numberOfFlashcards: formData.get("numberOfFlashcards"),
    });

    if (!validatedFields.success) {
      return { status: "error", message: "Invalid input." };
    }

    const { buffer } = await readFileFromFormData(formData, "pdf");
    const pdfData = await pdf(buffer);

    const result = await generateFlashcards({
      pdfText: pdfData.text,
      topic: validatedFields.data.topic,
      numberOfFlashcards: validatedFields.data.numberOfFlashcards,
    });

    return { status: "success", flashcards: result.flashcards };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

// Quiz Action
const quizSchema = z.object({
  numberOfQuestions: z.coerce.number().min(1).max(50),
});
export async function handleGenerateQuiz(prevState: any, formData: FormData) {
    try {
    const validatedFields = quizSchema.safeParse({
      numberOfQuestions: formData.get("numberOfQuestions"),
    });

    if (!validatedFields.success) {
      return { status: "error", message: "Invalid input." };
    }
    
    const { buffer } = await readFileFromFormData(formData, "pdf");
    const pdfData = await pdf(buffer);

    const result = await generateQuiz({
      studyMaterial: pdfData.text,
      numberOfQuestions: validatedFields.data.numberOfQuestions,
    });
    
    const quizData = JSON.parse(result.quiz);

    return { status: "success", quiz: quizData.quiz };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

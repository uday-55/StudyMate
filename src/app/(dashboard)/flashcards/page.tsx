"use client";

import React, { useState, useEffect, useRef, useActionState } from "react";
import { handleGenerateFlashcards } from "@/lib/actions";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, BookOpen, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FlashcardCarousel from "@/components/flashcards/FlashcardCarousel";
import { useToast } from "@/hooks/use-toast";

type Flashcard = { question: string; answer: string; };

export default function FlashcardsPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [state, formAction, isGenerating] = useActionState(handleGenerateFlashcards, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFormSubmit = (formData: FormData) => {
    if (!pdfFile) return;
    formData.append("pdf", pdfFile);
    formData.set("numberOfFlashcards", String(numFlashcards));
    formAction(formData);
  };
  
  useEffect(() => {
    if (state) {
      if (state.status === 'error') {
        toast({
          variant: "destructive",
          title: "Flashcard Generation Failed",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  const exportToCSV = (flashcards: Flashcard[]) => {
    const header = "question,answer\n";
    const csvContent = flashcards
      .map(fc => `"${fc.question.replace(/"/g, '""')}","${fc.answer.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "flashcards.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const flashcards = state?.status === 'success' ? state.flashcards : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>Create flashcards from your PDF document.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleFormSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>1. Upload PDF</Label>
              <FileUpload onFileChange={setPdfFile} disabled={isGenerating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">2. Topic</Label>
              <Input id="topic" name="topic" placeholder="e.g., Photosynthesis, Chapter 3" required disabled={isGenerating} />
            </div>
            <div className="space-y-3">
              <Label>3. Number of Flashcards: {numFlashcards}</Label>
              <Slider
                name="numberOfFlashcards"
                defaultValue={[5]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setNumFlashcards(value[0])}
                disabled={isGenerating}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating || !pdfFile} className="w-full">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : ( "Generate Flashcards" )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <AnimatePresence>
        {(isGenerating || flashcards) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Card className="h-full min-h-[460px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen /> Generated Flashcards
                </CardTitle>
                {flashcards && (
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(flashcards)}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {isGenerating && !flashcards ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : flashcards ? (
                  <FlashcardCarousel flashcards={flashcards} />
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

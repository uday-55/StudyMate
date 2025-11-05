"use client";

import React, { useState, useEffect, useRef, useActionState } from "react";
import { handleGenerateQuiz } from "@/lib/actions";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export default function QuizPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [state, formAction, isGenerating] = useActionState(handleGenerateQuiz, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFormSubmit = (formData: FormData) => {
    if (!pdfFile) return;
    formData.append("pdf", pdfFile);
    formData.set("numberOfQuestions", String(numQuestions));
    formAction(formData);
  };

  useEffect(() => {
    if (state) {
      if (state.status === 'error') {
        toast({
          variant: "destructive",
          title: "Quiz Generation Failed",
          description: state.message,
        });
      }
    }
  }, [state, toast]);
  
  const quiz = state?.status === 'success' ? state.quiz as QuizQuestion[] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Generate Quiz</CardTitle>
          <CardDescription>Test your knowledge with a quiz generated from your document.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleFormSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>1. Upload PDF</Label>
              <FileUpload onFileChange={setPdfFile} disabled={isGenerating} />
            </div>
            <div className="space-y-3">
              <Label>2. Number of Questions: {numQuestions}</Label>
              <Slider
                name="numberOfQuestions"
                defaultValue={[5]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setNumQuestions(value[0])}
                disabled={isGenerating}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating || !pdfFile} className="w-full">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : ( "Generate Quiz" )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <AnimatePresence>
        {(isGenerating || quiz) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle /> Generated Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating && !quiz ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : quiz ? (
                  <Accordion type="single" collapsible className="w-full">
                    {quiz.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                          <div className="flex justify-between items-center w-full pr-4">
                            <span className="text-left font-semibold">Question {index + 1}</span>
                            <Badge
                              variant="outline"
                              className={cn({
                                "bg-success/20 text-success-foreground border-success/30": item.difficulty === "Easy",
                                "bg-warning/20 text-warning-foreground border-warning/30": item.difficulty === "Medium",
                                "bg-destructive/20 text-destructive-foreground border-destructive/30": item.difficulty === "Hard",
                              })}
                            >
                              {item.difficulty}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 prose dark:prose-invert prose-sm">
                          <p>{item.question}</p>
                          <p><strong>Answer:</strong> {item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

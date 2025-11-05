"use client";

import React, { useState, useEffect, useRef, useActionState } from "react";
import { handleGenerateSummary } from "@/lib/actions";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SummarizePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [state, formAction, isGenerating] = useActionState(handleGenerateSummary, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFormSubmit = (formData: FormData) => {
    if (!pdfFile) return;
    formData.append("pdf", pdfFile);
    formAction(formData);
  };
  
  useEffect(() => {
    if (state) {
      if (state.status === 'error') {
        toast({
          variant: "destructive",
          title: "Summarization Failed",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Summarize Document</CardTitle>
          <CardDescription>Upload a PDF and choose a summary type to get started.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleFormSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>1. Upload PDF</Label>
              <FileUpload onFileChange={setPdfFile} disabled={isGenerating} />
            </div>
            <div className="space-y-3">
              <Label>2. Select Summary Type</Label>
              <RadioGroup name="summaryType" defaultValue="Quick Summary" className="flex gap-4" disabled={isGenerating}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Quick Summary" id="quick" />
                  <Label htmlFor="quick">Quick Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Detailed Summary" id="detailed" />
                  <Label htmlFor="detailed">Detailed Summary</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating || !pdfFile} className="w-full">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : ( "Generate Summary" )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <AnimatePresence>
        {(isGenerating || (state?.status === 'success' && state.summary)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText /> Generated Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {isGenerating && !state?.summary ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <p>{state?.summary}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

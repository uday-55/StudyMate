"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Paperclip, Send, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { handlePdfQuestion } from "@/lib/actions";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
      ) : (
        <Send className="h-5 w-5" />
      )}
      <span className="sr-only">Send</span>
    </Button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></span>
    </div>
  )
}

export default function ChatInterface() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [state, formAction] = useFormState(handlePdfQuestion, null);

  useEffect(() => {
    if (state?.status === "success" && state.answer) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.role === "system" ? { role: "assistant", content: state.answer! } : msg
        )
      );
    } else if (state?.status === "error") {
      setMessages((prev) =>
        prev.filter((msg) => msg.role !== "system")
      );
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = (formData: FormData) => {
    const question = formData.get("question") as string;
    if (!question.trim() || !pdfFile) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "system", content: "typing" },
    ]);
    
    formData.append("pdf", pdfFile);
    formAction(formData);
    formRef.current?.reset();
  };
  
  const isAwaitingResponse = messages.some(m => m.role === 'system');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Upload PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onFileChange={setPdfFile} disabled={isAwaitingResponse} />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 flex flex-col h-[calc(100vh-10rem)]">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === "user" ? "justify-end" : ""
                    )}
                  >
                    {message.role !== "user" && (
                       <Avatar className="h-8 w-8 border">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-xl rounded-lg px-4 py-2 prose prose-sm dark:prose-invert",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === 'system' ? <TypingIndicator /> : <p>{message.content}</p>}
                    </div>
                     {message.role === "user" && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {!messages.length && pdfFile && (
                 <div className="text-center text-muted-foreground pt-16">
                    Ask a question about <strong>{pdfFile.name}</strong> to get started.
                </div>
              )}
               {!messages.length && !pdfFile && (
                 <div className="text-center text-muted-foreground pt-16">
                    Please upload a PDF to start chatting.
                </div>
              )}
            </div>
          </ScrollArea>
          <form
            ref={formRef}
            action={handleFormSubmit}
            className="flex items-center gap-2 mt-4"
          >
            <Button variant="ghost" size="icon" type="button" className="shrink-0" disabled={!pdfFile || isAwaitingResponse}>
              <Mic className="h-5 w-5" />
              <span className="sr-only">Use Microphone</span>
            </Button>
            <Input
              name="question"
              placeholder="Ask a question..."
              autoComplete="off"
              disabled={!pdfFile || isAwaitingResponse}
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

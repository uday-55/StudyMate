"use client";

import React, { useState, useRef, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Paperclip, Send, Mic, Square, Volume2, Loader2, Waves, MessageCircle, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { handlePdfQuestion, handleGeneralChat, textToSpeech } from "@/lib/actions";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
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

type ChatMode = "qa" | "chat";

export default function QAPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>("qa");

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const [qaState, qaFormAction] = useActionState(handlePdfQuestion, null);
  const [chatState, chatFormAction] = useActionState(handleGeneralChat, null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const state = chatMode === 'qa' ? qaState : chatState;

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
    if (!question.trim()) return;
    
    if (chatMode === 'qa' && !pdfFile) {
        toast({ variant: 'destructive', title: 'PDF required', description: 'Please upload a PDF for Q&A mode.' });
        return;
    }

    const userMessage: ChatMessage = { role: "user", content: question };

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "system", content: "typing" },
    ]);
    
    if (chatMode === 'qa') {
        formData.append("pdf", pdfFile!);
        qaFormAction(formData);
    } else {
        const history = messages.filter(m => m.role !== 'system');
        formData.append('history', JSON.stringify(history));
        formData.append('message', question);
        chatFormAction(formData);
    }
    
    formRef.current?.reset();
  };
  
  const handleModeChange = (isChatMode: boolean) => {
    setChatMode(isChatMode ? 'chat' : 'qa');
    setMessages([]);
    setPdfFile(null);
  }

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Speech recognition not supported in this browser.' });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = (event: any) => {
      toast({ variant: 'destructive', title: 'Speech recognition error', description: event.error });
      setIsRecording(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      if (inputRef.current) {
        inputRef.current.value = transcript;
      }
      if (event.results[0].isFinal) {
        if(formRef.current) {
            formRef.current.requestSubmit();
        }
      }
    };
    recognitionRef.current.start();
  };
  
  const readAloud = async (text: string) => {
    try {
      const result = await textToSpeech(text);
      if (result.status === 'success' && result.media) {
          if (audioRef.current) {
              audioRef.current.src = result.media;
              audioRef.current.play();
          }
      } else {
        toast({ variant: 'destructive', title: 'Text-to-speech failed', description: result.message });
      }
    } catch(e) {
      toast({ variant: 'destructive', title: 'Text-to-speech failed', description: (e as Error).message });
    }
  }

  const isAwaitingResponse = messages.some(m => m.role === 'system');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {chatMode === 'qa' ? <Bot/> : <MessageCircle/>}
            {chatMode === 'qa' ? 'PDF Q&A' : 'General Chat'}
          </CardTitle>
          <CardDescription>
            {chatMode === 'qa' ? 'Upload a document to ask questions.' : 'Chat with the AI assistant.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center space-x-2">
            <Label htmlFor="chat-mode">Q&A Mode</Label>
            <Switch id="chat-mode" checked={chatMode === 'chat'} onCheckedChange={handleModeChange} />
            <Label htmlFor="chat-mode">General Chat</Label>
          </div>
          {chatMode === 'qa' && (
            <FileUpload onFileChange={setPdfFile} disabled={isAwaitingResponse} />
          )}
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
                        "max-w-xl rounded-lg px-4 py-2 prose prose-sm dark:prose-invert relative group",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === 'system' ? <TypingIndicator /> : <p>{message.content}</p>}
                      {message.role === 'assistant' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => readAloud(message.content)}
                        >
                            <Volume2 className="h-4 w-4"/>
                            <span className="sr-only">Read aloud</span>
                        </Button>
                      )}
                    </div>
                     {message.role === "user" && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {!messages.length && (
                 <div className="text-center text-muted-foreground pt-16">
                    {chatMode === 'qa' ? (
                        pdfFile ? `Ask a question about <strong>${pdfFile.name}</strong> to get started.` : 'Please upload a PDF to start chatting.'
                    ) : 'Ask anything to get started.'}
                </div>
              )}
            </div>
          </ScrollArea>
          <form
            ref={formRef}
            action={handleFormSubmit}
            className="flex items-center gap-2 mt-4"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              type="button" 
              className="shrink-0 relative" 
              onClick={handleMicClick}
              disabled={(chatMode === 'qa' && !pdfFile) || isAwaitingResponse}
            >
              {isRecording ? <Square className="h-5 w-5"/> : <Mic className="h-5 w-5" />}
              {isRecording && <Waves className="h-5 w-5 absolute text-primary animate-ping"/>}
              <span className="sr-only">{isRecording ? "Stop Recording" : "Use Microphone"}</span>
            </Button>
            <Input
              ref={inputRef}
              name="question"
              placeholder={chatMode === 'qa' ? 'Ask a question about the PDF...' : 'Ask anything...'}
              autoComplete="off"
              disabled={(chatMode === 'qa' && !pdfFile) || isAwaitingResponse}
            />
            <SubmitButton disabled={(chatMode === 'qa' && !pdfFile) || isAwaitingResponse} />
          </form>
          <audio ref={audioRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
}

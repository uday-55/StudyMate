
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const quotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Success is not the key to happiness. Happiness is the key to success.",
  "Believe you can and you're halfway there.",
];

type Session = {
  type: "Work" | "Break";
  duration: number;
  completedAt: Date;
};

export default function PomodoroPage() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [currentQuote, setCurrentQuote] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("pomodoroHistory");
      if (storedHistory) {
        setSessionHistory(JSON.parse(storedHistory).map((s: any) => ({ ...s, completedAt: new Date(s.completedAt)})));
      }
      audioRef.current = new Audio('/sounds/notification.mp3');
    }
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem("pomodoroHistory", JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const addSessionToHistory = (type: "Work" | "Break", duration: number) => {
    const newSession: Session = { type, duration, completedAt: new Date() };
    setSessionHistory(prev => [newSession, ...prev]);
  };
  
  const playNotification = () => {
    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playNotification();
      addSessionToHistory(isWorkSession ? "Work" : "Break", isWorkSession ? workDuration : breakDuration);
      const nextIsWork = !isWorkSession;
      setIsWorkSession(nextIsWork);
      setTimeLeft((nextIsWork ? workDuration : breakDuration) * 60);
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWorkSession, workDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration * 60);
  }, [workDuration]);

  useEffect(() => {
    if(!isActive) resetTimer();
  }, [workDuration, breakDuration, isActive, resetTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const progress = ((isWorkSession ? workDuration * 60 - timeLeft : breakDuration * 60 - timeLeft) / (isWorkSession ? workDuration * 60 : breakDuration * 60)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{isWorkSession ? "Work Session" : "Break Time"}</CardTitle>
                <CardDescription>Stay focused and productive.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <motion.div
                    key={timeLeft}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-8xl font-bold font-mono tracking-tighter"
                >
                    {formatTime(timeLeft)}
                </motion.div>
                <Progress value={progress} className="w-full max-w-md"/>

                <div className="flex gap-4 mt-4">
                    <Button onClick={toggleTimer} size="lg" className="w-32">
                    {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                    {isActive ? "Pause" : "Start"}
                    </Button>
                    <Button onClick={resetTimer} size="lg" variant="outline" className="w-32">
                    <RotateCcw className="mr-2" /> Reset
                    </Button>
                </div>
                <blockquote className="mt-6 italic text-muted-foreground">
                    &ldquo;{currentQuote}&rdquo;
                </blockquote>
            </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your session durations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Math.max(1, Number(e.target.value)))}
                disabled={isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-duration">Break (minutes)</Label>
              <Input
                id="break-duration"
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Math.max(1, Number(e.target.value)))}
                disabled={isActive}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History /> Session History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-right">Completed</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessionHistory.slice(0, 5).map((session, index) => (
                            <TableRow key={index}>
                                <TableCell>{session.type}</TableCell>
                                <TableCell>{session.duration} min</TableCell>
                                <TableCell className="text-right">{format(session.completedAt, 'p')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {sessionHistory.length === 0 && (
                    <p className="text-center text-muted-foreground p-4">No sessions completed yet.</p>
                )}
            </CardContent>
        </Card>
      </div>
       <audio src="/sounds/notification.mp3" ref={audioRef} preload="auto"></audio>
    </div>
  );
}

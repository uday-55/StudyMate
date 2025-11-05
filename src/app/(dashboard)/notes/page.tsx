"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
};

const noteColors = [
  "bg-yellow-200 dark:bg-yellow-800",
  "bg-blue-200 dark:bg-blue-800",
  "bg-green-200 dark:bg-green-800",
  "bg-pink-200 dark:bg-pink-800",
  "bg-purple-200 dark:bg-purple-800",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem("stickyNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      text: "New Note",
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      position: { x: 50, y: 50 },
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const updateNoteText = (id: string, text: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, text } : note))
    );
  };
  
  const updateNoteColor = (id: string, color: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, color } : note))
    );
  };

  const handleDragEnd = (id: string, info: any) => {
    const { x, y } = info.point;
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, position: { x, y } } : note))
    );
  };

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Sticky Notes</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={addNote}>
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </div>
      </header>
      <main ref={boardRef} className="flex-1 relative overflow-hidden bg-muted/20">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            drag
            dragConstraints={boardRef}
            dragMomentum={false}
            onDragEnd={(_, info) => handleDragEnd(note.id, info)}
            initial={{ x: note.position.x, y: note.position.y }}
            className="absolute w-64 h-64 cursor-grab"
            whileDrag={{ cursor: "grabbing", zIndex: 10 }}
          >
            <Card className={cn("w-full h-full shadow-lg group", note.color)}>
              <CardContent className="p-0 h-full">
                <Textarea
                  value={note.text}
                  onChange={(e) => updateNoteText(note.id, e.target.value)}
                  className="w-full h-full bg-transparent border-0 resize-none focus-visible:ring-0 p-4 text-card-foreground/80 dark:text-card-foreground"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateNoteColor(note.id, color)}
                      className={cn("w-4 h-4 rounded-full border", color, {
                        "ring-2 ring-primary": note.color === color,
                      })}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {notes.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <h2 className="text-xl font-semibold">No notes yet</h2>
              <p>Click "Add Note" to get started.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

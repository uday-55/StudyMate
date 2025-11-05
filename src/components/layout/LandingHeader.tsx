
"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton } from "./UserButton";

const features = [
  { href: "/qa", label: "Q&A" },
  { href: "/summarize", label: "Summarize" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Quiz" },
  { href: "/concept-map", label: "Concept Map" },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            StudyMate
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {feature.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
             <Button asChild>
                <Link href="/qa">Get Started</Link>
              </Button>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

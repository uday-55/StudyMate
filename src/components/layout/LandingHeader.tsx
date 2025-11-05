
"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/qa", label: "Q&A" },
  { href: "/summarize", label: "Summarize" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Quiz" },
  { href: "/concept-map", label: "Concept Map" },
];

export default function LandingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            StudyMate
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-8 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-base font-medium text-foreground/70 transition-colors hover:text-foreground/90 hover:font-semibold",
                pathname === item.href && "text-primary font-semibold border-b-2 border-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
             <Button asChild size="lg">
                <Link href="/qa">Get Started</Link>
              </Button>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

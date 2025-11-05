"use client";

import Link from "next/link";
import {
  Bot,
  FileText,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Share2,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { href: "/qa", icon: Bot, label: "PDF Q&A" },
  { href: "/summarize", icon: FileText, label: "Summarization" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/quiz", icon: HelpCircle, label: "Quiz" },
  { href: "/concept-map", icon: Share2, label: "Concept Map" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const currentNavItem = sidebarNavItems.find(item => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Lightbulb className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">StudyMate</span>
            </Link>
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <h1 className="text-xl font-semibold hidden md:flex">{currentNavItem?.label || 'Dashboard'}</h1>
      <div className="relative ml-auto flex-1 md:grow-0" />
      <ThemeToggle />
    </header>
  );
}

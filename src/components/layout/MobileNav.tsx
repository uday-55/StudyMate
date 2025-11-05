
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Share2,
  Home,
  Clock,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/qa", icon: Bot, label: "PDF Q&A" },
  { href: "/summarize", icon: FileText, label: "Summarization" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/quiz", icon: HelpCircle, label: "Quiz" },
  { href: "/pomodoro", icon: Clock, label: "Pomodoro Timer" },
  { href: "/notes", icon: StickyNote, label: "Sticky Notes" },
  { href: "/concept-map", icon: Share2, label: "Concept Map" },
];

export default function MobileNav() {
    const pathname = usePathname();
    const isRoot = pathname === '/';

    return (
        <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base mb-4"
            >
              <Lightbulb className="h-6 w-6 transition-all group-hover:scale-110" />
              <span className="sr-only">StudyMate</span>
            </Link>
            {sidebarNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn("flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", 
                        (item.href === '/' && isRoot) || (item.href !== '/' && pathname.startsWith(item.href)) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                    )}
                >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xl">{item.label}</span>
                </Link>
            ))}
        </nav>
    )
}

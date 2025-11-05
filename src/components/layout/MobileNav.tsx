
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/qa", icon: Bot, label: "PDF Q&A" },
  { href: "/summarize", icon: FileText, label: "Summarization" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/quiz", icon: HelpCircle, label: "Quiz" },
  { href: "/concept-map", icon: Share2, label: "Concept Map" },
];

export default function MobileNav() {
    const pathname = usePathname();
    const isRoot = pathname === '/';

    return (
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
                    className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", 
                        (item.href === '/' && isRoot) || (item.href !== '/' && pathname.startsWith(item.href)) ? "text-foreground" : ""
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}

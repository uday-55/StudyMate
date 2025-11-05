
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
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarNavItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/qa", icon: Bot, label: "PDF Q&A" },
  { href: "/summarize", icon: FileText, label: "Summarization" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/quiz", icon: HelpCircle, label: "Quiz" },
  { href: "/concept-map", icon: Share2, label: "Concept Map" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-6 px-2 sm:py-6">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-10"
          >
            <Lightbulb className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">StudyMate</span>
          </Link>
          {sidebarNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-accent md:h-10 md:w-10",
                    (item.href === '/' && isRoot) || (item.href !== '/' && pathname.startsWith(item.href))
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : ""
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-6 px-2 sm:py-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10",
                  pathname.startsWith('/settings') && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                <Settings className="h-6 w-6" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-base">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}

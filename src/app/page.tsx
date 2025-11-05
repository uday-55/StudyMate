import Link from 'next/link';
import {
  Bot,
  FileText,
  BookOpen,
  HelpCircle,
  Share2,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    href: '/qa',
    icon: Bot,
    label: 'PDF Q&A',
    description: 'Ask questions and get instant answers from your PDF documents.',
  },
  {
    href: '/summarize',
    icon: FileText,
    label: 'Summarization',
    description: 'Generate quick or detailed summaries of your study materials.',
  },
  {
    href: '/flashcards',
    icon: BookOpen,
    label: 'Flashcards',
    description: 'Create interactive flashcards to test your knowledge.',
  },
  {
    href: '/quiz',
    icon: HelpCircle,
    label: 'Quiz',
    description: 'Generate quizzes from your documents to prepare for exams.',
  },
  {
    href: '/concept-map',
    icon: Share2,
    label: 'Concept Map',
    description: 'Visualize connections and relationships between topics.',
    isNew: true,
  },
];

export default function RootPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to StudyMate</h1>
        <p className="text-muted-foreground mt-2">Your AI-powered study partner. Select a feature to get started.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href}>
            <Card className="group hover:bg-muted/50 transition-colors h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-primary" />
                  {feature.isNew && <Badge>Coming Soon</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle>{feature.label}</CardTitle>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                  <div className="flex items-center text-sm font-semibold text-primary group-hover:underline">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

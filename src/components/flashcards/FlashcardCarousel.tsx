"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

type Flashcard = {
  question: string;
  answer: string;
};

interface FlashcardCarouselProps {
  flashcards: Flashcard[];
}

function FlippableCard({ card, onFlip }: { card: Flashcard, onFlip: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip();
  }

  return (
    <div
      className="w-full h-64 [perspective:1000px] cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Card className="w-full h-full flex flex-col justify-center items-center">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Question</p>
              <p className="text-lg font-semibold">{card.question}</p>
            </CardContent>
          </Card>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="w-full h-full flex flex-col justify-center items-center bg-secondary">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Answer</p>
              <p>{card.answer}</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default function FlashcardCarousel({ flashcards }: FlashcardCarouselProps) {
  const [key, setKey] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No flashcards generated.
      </div>
    );
  }

  // Reset flip state when carousel changes
  const handleSlideChange = () => {
    setKey(prev => prev + 1);
  }

  return (
    <Carousel className="w-full max-w-lg" onApi={api => api?.on('select', handleSlideChange)}>
      <CarouselContent key={key}>
        {flashcards.map((card, index) => (
          <CarouselItem key={index}>
            <FlippableCard card={card} onFlip={() => {}} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-12" />
      <CarouselNext className="mr-12" />
    </Carousel>
  );
}

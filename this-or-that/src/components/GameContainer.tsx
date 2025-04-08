"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface GameContainerProps {
  title: string;
  children: ReactNode;
  score?: number;
  totalQuestions?: number;
  onSettingsClick?: () => void;
}

/**
 * A container component for all game types providing consistent layout and scoring
 */
export default function GameContainer({ 
  title, 
  children, 
  score = 0, 
  totalQuestions = 0,
  onSettingsClick 
}: GameContainerProps) {
  return (
    <div>
      <div>
        <header>
          <Link href="/">
            Home
          </Link>
          <h1>{title}</h1>
          <div>
            {onSettingsClick && (
              <button onClick={onSettingsClick} title="Game Settings">
                Settings
              </button>
            )}
            {totalQuestions > 0 && (
              <div>
                {score}/{totalQuestions}
              </div>
            )}
          </div>
        </header>
      </div>

      <main>
        {children}
      </main>
    </div>
  );
} 
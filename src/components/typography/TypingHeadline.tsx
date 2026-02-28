'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingHeadlineProps {
  words: string[];
  className?: string;
}

export default function TypingHeadline({ words, className = '' }: TypingHeadlineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = words[currentIndex];

    if (!isDeleting) {
      // Typing animation
      if (displayText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 100 + Math.random() * 50);
        return () => clearTimeout(timeout);
      } else {
        // Wait before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting animation
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50 + Math.random() * 30);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [displayText, isDeleting, currentIndex, words]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(90deg, #c084fc, #22d3ee, #f472b6)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        animate={{ opacity: showCursor ? 1 : 0 }}
        className="inline-block w-[2px] h-[1em] bg-cyan-400"
      />
    </div>
  );
}

// Multi-word typing effect for main headlines
interface MultiWordTypingProps {
  prefix?: string;
  words: string[];
  suffix?: string;
  className?: string;
}

export function MultiWordTyping({ prefix, words, suffix, className = '' }: MultiWordTypingProps) {
  return (
    <span className={className}>
      {prefix && <span className="text-white">{prefix} </span>}
      <TypingHeadline words={words} />
      {suffix && <span className="text-white"> {suffix}</span>}
    </span>
  );
}

// Character-by-character animation for larger text
interface CharacterByCharacterProps {
  text: string;
  className?: string;
  delay?: number;
}

export function CharacterByCharacter({ text, className = '', delay = 0.05 }: CharacterByCharacterProps) {
  const characters = text.split('');

  return (
    <span className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * delay,
            duration: 0.3,
            ease: 'easeOut',
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

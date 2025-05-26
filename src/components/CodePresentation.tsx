
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const codeLinesRaw = [
  { text: '// Welcome to EventLink!', type: 'comment' },
  { text: ' ', type: 'blank' },
  { text: 'const newEvent = createEvent({', type: 'code' },
  { text: '  name: "My Awesome Launch Party",', type: 'code-indent' },
  { text: '  date: "2024-12-31",', type: 'code-indent' },
  { text: '  theme: "modern",', type: 'code-indent' },
  { text: '  features: ["liveRSVP", "easyShare"]', type: 'code-indent' },
  { text: '});', type: 'code' },
  { text: ' ', type: 'blank' },
  { text: 'share(newEvent.link);', type: 'code' },
  { text: 'track(newEvent.rsvps);', type: 'code' },
  { text: ' ', type: 'blank' },
  { text: '// Your event, beautifully managed!', type: 'comment' },
];

const typingSpeed = 40; // ms per character
const lineDelay = 300; // ms between lines

const CodePresentation = () => {
  const [displayedLines, setDisplayedLines] = useState<Array<{ id: number; text: string; type: string }>>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Typical cursor blink rate
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentLineIndex < codeLinesRaw.length) {
      const currentLine = codeLinesRaw[currentLineIndex];
      if (currentCharIndex < currentLine.text.length) {
        const timer = setTimeout(() => {
          setDisplayedLines(prev => {
            const lines = [...prev];
            if (lines.length === currentLineIndex) {
              lines.push({ id: currentLineIndex, text: '', type: currentLine.type });
            }
            lines[currentLineIndex].text += currentLine.text[currentCharIndex];
            return lines;
          });
          setCurrentCharIndex(prev => prev + 1);
        }, currentLine.type === 'blank' ? Math.min(typingSpeed, 10) : typingSpeed); // Blank lines appear faster
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, lineDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, currentCharIndex]);

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'comment':
        return 'text-green-500'; // Specific color for comments for clarity
      case 'code-indent':
        return 'pl-6 text-gray-300'; // Increased indent
      default:
        return 'text-gray-300';
    }
  };
  
  const highlightSyntax = (lineText: string, type: string) => {
    if (type === 'comment' || type === 'blank') return lineText;

    let highlightedText = lineText;
    // Keywords (using primary theme color)
    highlightedText = highlightedText.replace(/\b(const|let|var|function|return|if|else|for|while|new)\b/g, '<span class="text-primary">$1</span>');
    // Strings (using accent theme color)
    highlightedText = highlightedText.replace(/(".*?")/g, '<span class="text-accent">$1</span>');
    highlightedText = highlightedText.replace(/('.*?')/g, '<span class="text-accent">$1</span>');
    // Numbers (using a secondary color variation or specific one)
    highlightedText = highlightedText.replace(/\b(\d+)\b/g, '<span class="text-secondary/90">$1</span>');
    // Punctuation (using muted-foreground theme color)
    highlightedText = highlightedText.replace(/(\{|\}|\(|\)|\[|\]|,|;|\:)/g, '<span class="text-muted-foreground">$1</span>');
    // Function/method names (using secondary-foreground or specific)
    highlightedText = highlightedText.replace(/\b(createEvent|share|track)\b/g, '<span class="text-secondary-foreground">$1</span>');

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="font-mono text-xs sm:text-sm md:text-base p-4 sm:p-6 md:p-8 rounded-lg overflow-auto h-full w-full bg-gray-900 flex flex-col justify-center selection:bg-primary selection:text-primary-foreground">
      <pre className="whitespace-pre-wrap">
        {displayedLines.map((line, lineIdx) => (
          <div key={line.id} className={cn(getLineStyle(line.type), 'min-h-[1.2em]')}> {/* Ensure line height even if empty initially */}
            {highlightSyntax(line.text, line.type)}
            {lineIdx === currentLineIndex && 
             currentLineIndex < codeLinesRaw.length && 
             currentCharIndex < codeLinesRaw[currentLineIndex].text.length && 
             showCursor && <span className="bg-gray-300 w-[2px] h-[1em] inline-block animate-pulse ml-px"></span>}
          </div>
        ))}
         {currentLineIndex >= codeLinesRaw.length && showCursor && <span className="bg-gray-300 w-[2px] h-[1em] inline-block animate-pulse ml-px"></span>}
      </pre>
    </div>
  );
};

export default CodePresentation;

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          EventLink
        </Link>
        <nav>
          <Button asChild variant="default">
            <Link href="/create">
              <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
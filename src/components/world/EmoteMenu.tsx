
'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmoteMenuProps {
  onEmote: (emote: string) => void;
}

const emotes = ['👋', '❤️', '👍', '😂', '❓'];

export default function EmoteMenu({ onEmote }: EmoteMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full w-12 h-12 shadow-lg">
          <Smile className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="flex gap-1 p-2">
        {emotes.map((emote) => (
          <DropdownMenuItem
            key={emote}
            onSelect={() => onEmote(emote)}
            className="p-0"
          >
            <Button variant="ghost" size="icon" className="text-2xl w-10 h-10">
              {emote}
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

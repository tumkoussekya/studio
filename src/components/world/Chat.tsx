
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SendHorizonal } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

export interface Message {
  author: string;
  text: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function Chat({ messages, onSendMessage }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[40vh] md:h-auto md:flex-grow mt-4 md:mt-0 border-t">
      <h3 className="text-lg font-semibold mb-2 px-4 pt-4">Chat</h3>
      <ScrollArea className="flex-grow" viewportRef={scrollViewportRef}>
        <div className="space-y-4 px-4 pb-4">
          {messages.map((msg, index) => (
            <div key={index}>
              <span className={`font-bold ${msg.author === 'You' ? 'text-primary' : (msg.author === 'System' || msg.author === 'Server') ? 'text-muted-foreground' : 'text-accent-foreground'}`}>
                {msg.author}:
              </span>{' '}
              <span className="text-muted-foreground break-words">{msg.text}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 flex items-center gap-2 border-t mt-auto">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Say something..."
          className="flex-grow"
        />
        <Button type="submit" size="icon" variant="ghost" className="text-primary hover:text-primary">
          <SendHorizonal />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

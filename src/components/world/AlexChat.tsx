
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal, Sparkles } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { chatWithAlex, type ChatWithAlexInput } from '@/ai/flows/alex-convo';

interface AlexMessage {
  role: 'user' | 'model';
  content: string;
}

export default function AlexChat() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AlexMessage[]>([
    { role: 'model', content: "Hello there! I'm Alex. You can ask me to create tasks for your Kanban board or suggest what to do next." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: AlexMessage = { role: 'user', content: messageText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input: ChatWithAlexInput = {
        history: messages,
        newMessage: userMessage.content,
      };
      const result = await chatWithAlex(input);
      
      const alexMessage: AlexMessage = { role: 'model', content: result.response };
      setMessages(prev => [...prev, alexMessage]);

    } catch (error) {
      console.error('AI Error:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Alex is a bit busy right now. Please try again later.",
      });
      // remove the user message if the API call fails
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };
  
  const handleSuggestionClick = () => {
    handleSendMessage("What should I do next?");
  }

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[268px] border rounded-lg">
      <div className="p-3 border-b flex items-center gap-2">
         <Sparkles className="text-accent h-5 w-5" />
         <h3 className="text-base font-semibold">Chat with Alex</h3>
      </div>
      <ScrollArea className="flex-grow bg-secondary/30" viewportRef={scrollViewportRef}>
        <div className="space-y-3 p-3 text-sm">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`rounded-lg px-3 py-2 max-w-[80%] break-words ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.content}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                 <div className="rounded-lg px-3 py-2 bg-muted animate-pulse">
                    ...
                 </div>
            </div>
          )}
        </div>
      </ScrollArea>
       <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={handleSuggestionClick} disabled={isLoading}>
              What should I do next?
          </Button>
      </div>
      <form onSubmit={handleSubmit} className="p-2 flex items-center gap-2 border-t">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. 'Add a high priority task'"
          className="flex-grow h-9"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" variant="ghost" className="text-primary hover:text-primary h-9 w-9" disabled={isLoading}>
          <SendHorizonal />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useState } from 'react';

import Chat, { type Message } from '@/components/world/Chat';
import ConversationStarter from '@/components/world/ConversationStarter';
import AudioControl from '@/components/world/AudioControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PhaserContainer = dynamic(() => import('@/components/world/PhaserContainer'), {
  ssr: false,
});

export default function WorldPage() {
  const [isNear, setIsNear] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { author: 'System', text: 'Welcome to Pixel Space! Use WASD or arrow keys to move.' },
  ]);

  const handlePlayerNear = useCallback(() => {
    setIsNear(true);
  }, []);

  const handlePlayerFar = useCallback(() => {
    setIsNear(false);
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { author: 'You', text }]);
    // In a real app, this would be sent to a server.
    // We'll simulate a response for demo purposes.
    setTimeout(() => {
        setMessages((prev) => [...prev, { author: 'Alex', text: 'Hey there!' }]);
    }, 1500)
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      <div className="flex-grow relative order-2 md:order-1">
        <PhaserContainer onPlayerNear={handlePlayerNear} onPlayerFar={handlePlayerFar} />
      </div>
      <aside className="w-full md:w-80 lg:w-96 border-l bg-card p-4 flex flex-col gap-4 order-1 md:order-2 shrink-0">
        <Card className="h-full flex flex-col shadow-none border-none">
            <CardHeader>
                <CardTitle>Pixel Space</CardTitle>
                <CardDescription>Your virtual commons room.</CardDescription>
                <AudioControl />
            </CardHeader>
            <Separator />
            <CardContent className="p-0 flex-grow flex flex-col">
                <div className="p-4">
                  {isNear ? <ConversationStarter /> : (
                     <div className="h-full flex items-center justify-center text-center text-muted-foreground p-8">
                        <p>Move your avatar closer to Alex to get an AI-powered conversation starter!</p>
                    </div>
                  )}
                </div>
                <Chat messages={messages} onSendMessage={handleSendMessage} />
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}

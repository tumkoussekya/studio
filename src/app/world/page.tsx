
'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import type * as Ably from 'ably';

import Chat, { type Message } from '@/components/world/Chat';
import ConversationStarter from '@/components/world/ConversationStarter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { chatService, type PresenceData } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';
import LogoutButton from '@/components/world/LogoutButton';
import UserList from '@/components/world/UserList';
import { getCookie } from 'cookies-next';
import AudioControl from '@/components/world/AudioControl';

const PhaserContainer = dynamic(() => import('@/components/world/PhaserContainer'), {
  ssr: false,
});

export default function WorldPage() {
  const [isNear, setIsNear] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { author: 'System', text: 'Welcome to Pixel Space! Use WASD or arrow keys to move.' },
  ]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const token = getCookie('token') as string;
    let userEmail = '';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userEmail = payload.email;
            setCurrentUserEmail(userEmail);

            // Connect to the chat service and enter presence
            chatService.enterPresence({ email: userEmail });
            
        } catch (e) {
            console.error("Failed to decode token or connect to chat:", e);
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Could not verify your session.' });
            return;
        }
    }

    // --- Register all event handlers ---
    chatService.onMessage((message: Ably.Types.Message) => {
        const authorEmail = (message.data.author || message.clientId);
        const author = authorEmail === userEmail ? 'You' : authorEmail;
        setMessages((prev) => [...prev, { author, text: message.data.text }]);
    });
    
    chatService.onInitialUsers((users: string[]) => {
        setOnlineUsers(users);
    });

    chatService.onUserJoined((member: Ably.Types.PresenceMessage) => {
        const joinedEmail = (member.data as PresenceData).email;
        if(joinedEmail === userEmail) return; // Don't announce self
        
        setOnlineUsers((prev) => [...new Set([...prev, joinedEmail])]);
        toast({ title: 'User Joined', description: `${joinedEmail} has entered the space.` });
    });
    
    chatService.onUserLeft((member: Ably.Types.PresenceMessage) => {
        const leftEmail = (member.data as PresenceData).email;
        setOnlineUsers((prev) => prev.filter(email => email !== leftEmail));
        toast({ title: 'User Left', description: `${leftEmail} has left the space.` });
    });

    // This must be called to start listening to the events.
    chatService.subscribeToEvents();


    return () => {
      chatService.disconnect();
    };
  }, [toast]);


  const handlePlayerNear = useCallback(() => {
    setIsNear(true);
  }, []);

  const handlePlayerFar = useCallback(() => {
    setIsNear(false);
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    chatService.sendMessage(text);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      <div className="flex-grow relative order-2 md:order-1">
        <PhaserContainer onPlayerNear={handlePlayerNear} onPlayerFar={handlePlayerFar} />
      </div>
      <aside className="w-full md:w-80 lg:w-96 border-l bg-card p-4 flex flex-col gap-4 order-1 md:order-2 shrink-0">
        <Card className="h-full flex flex-col shadow-none border-none">
            <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pixel Space</CardTitle>
                    <CardDescription>Your virtual commons room.</CardDescription>
                  </div>
                  <LogoutButton />
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0 flex-grow flex flex-col min-h-0">
                <div className="p-4">
                  {isNear ? <ConversationStarter /> : (
                     <div className="h-[188px] flex items-center justify-center text-center text-muted-foreground p-8">
                        <p>Move your avatar closer to Alex to get an AI-powered conversation starter!</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="p-4">
                  <AudioControl />
                </div>
                <Separator />
                <UserList users={onlineUsers} />
                <Chat messages={messages} onSendMessage={handleSendMessage} />
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}

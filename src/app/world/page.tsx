
'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import type * as Ably from 'ably';

import Chat, { type Message } from '@/components/world/Chat';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { realtimeService, type PresenceData, type PlayerUpdateData, type KnockData } from '@/services/RealtimeService';
import { useToast } from '@/hooks/use-toast';
import LogoutButton from '@/components/world/LogoutButton';
import UserList from '@/components/world/UserList';
import AudioControl from '@/components/world/AudioControl';
import type { MainScene } from '@/lib/phaser/scenes/MainScene';
import { useRouter } from 'next/navigation';
import AlexChat from '@/components/world/AlexChat';
import KnockButton from '@/components/world/KnockButton';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { MessageSquare, Rss } from 'lucide-react';
import Announcements from '@/components/chat/Announcements';
import type { UserRole } from '@/models/User';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';


const PhaserContainer = dynamic(() => import('@/components/world/PhaserContainer'), {
  ssr: false,
});

export default function WorldPage() {
  const [isNearAlex, setIsNearAlex] = useState(false);
  const [nearbyPlayer, setNearbyPlayer] = useState<{ clientId: string; email: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { author: 'System', text: 'Welcome to SyncroSpace! Use WASD or arrow keys to move. Click on other players to "knock"!' },
  ]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string, id: string, role: UserRole, last_x: number, last_y: number } | null>(null);
  const { toast } = useToast();
  const sceneRef = useRef<MainScene | null>(null);
  const router = useRouter();
  const [activeRightPanel, setActiveRightPanel] = useState('chat');


  useEffect(() => {
    // This is the recommended client-side Supabase client.
    const supabase = createClient();

    const fetchUserAndConnect = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, role, last_x, last_y')
            .eq('id', session.user.id)
            .single();

        if (error || !userData) {
            console.error("Failed to fetch user data", error);
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Could not fetch your profile.' });
            router.push('/login');
            return;
        }

        setCurrentUser(userData);
        realtimeService.enterPresence({ email: userData.email });
    }

    fetchUserAndConnect();

    const handleShowAnnouncements = () => {
        setActiveRightPanel('announcements');
        toast({
            title: "Bulletin Board",
            description: "Showing latest announcements.",
        });
    }

    window.addEventListener('show-announcements', handleShowAnnouncements);

    return () => {
        window.removeEventListener('show-announcements', handleShowAnnouncements);
    }

  }, [router, toast]);


  useEffect(() => {
    if (!currentUser) return;

    // --- Register all event handlers ---
    const handleNewMessage = (message: Ably.Types.Message) => {
        const authorEmail = (message.data.author || message.clientId);
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        setMessages((prev) => [...prev, { author, text: message.data.text }]);
    };
    
    const handleInitialUsers = (users: Ably.Types.PresenceMessage[]) => {
        const userEmails = users.map(u => (u.data as PresenceData).email);
        setOnlineUsers(userEmails);
    };

    const handleUserJoined = (member: Ably.Types.PresenceMessage) => {
        const joinedEmail = (member.data as PresenceData).email;
        if(joinedEmail === currentUser.email) return;
        
        setOnlineUsers((prev) => [...new Set([...prev, joinedEmail])]);
        toast({ title: 'User Joined', description: `${joinedEmail} has entered the space.` });
    };
    
    const handleUserLeft = (member: Ably.Types.PresenceMessage) => {
        const leftEmail = (member.data as PresenceData).email;
        setOnlineUsers((prev) => prev.filter(email => email !== leftEmail));
        toast({ title: 'User Left', description: `${leftEmail} has left the space.` });
        sceneRef.current?.removePlayer(member.clientId);
    };

    const handleHistory = (history: Ably.Types.Message[]) => {
      const pastMessages: Message[] = history.map(message => {
        const authorEmail = (message.data.author || message.clientId);
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        return { author, text: message.data.text };
      });
      setMessages(prev => [...prev, ...pastMessages.reverse()]);
    };
    
    const handlePlayerUpdate = (message: Ably.Types.Message) => {
        const data = message.data as PlayerUpdateData;
        if (data.clientId !== currentUser.id) {
           sceneRef.current?.updatePlayer(data.clientId, data.x, data.y, data.email);
        }
    };
    
    const handleKnock = (data: KnockData) => {
        toast({
            title: 'Someone is knocking!',
            description: `${data.fromEmail} is knocking.`,
            duration: 5000,
        });
    };

    realtimeService.onMessage(handleNewMessage);
    realtimeService.onInitialUsers(handleInitialUsers);
    realtimeService.onUserJoined(handleUserJoined);
    realtimeService.onUserLeft(handleUserLeft);
    realtimeService.onHistory(handleHistory);
    realtimeService.onPlayerUpdate(handlePlayerUpdate);
    realtimeService.onKnock(handleKnock);

    // This must be called to start listening to the events.
    realtimeService.subscribeToEvents();

    return () => {
      // It's good practice to disconnect and clean up listeners
      realtimeService.disconnect();
    };
  }, [currentUser, toast]);


  const handlePlayerNearNpc = useCallback(() => {
    setIsNearAlex(true);
  }, []);

  const handlePlayerFarNpc = useCallback(() => {
    setIsNearAlex(false);
  }, []);
  
  const handlePlayerNear = useCallback((clientId: string, email: string) => {
    setNearbyPlayer({ clientId, email });
  }, []);

  const handlePlayerFar = useCallback(() => {
    setNearbyPlayer(null);
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    if (!currentUser) return;
    realtimeService.sendMessage(text, { author: currentUser.email });
  }, [currentUser]);
  
  const renderInteractionPanel = () => {
      if (isNearAlex) {
          return <AlexChat />;
      }
      if (nearbyPlayer) {
          return <KnockButton 
                    player={nearbyPlayer} 
                    onKnock={(targetClientId) => {
                        if (currentUser) {
                           realtimeService.sendKnock(targetClientId, currentUser.email);
                           toast({ title: `You knocked on ${nearbyPlayer.email}!`});
                        }
                    }}
                 />;
      }
      return (
          <div className="h-[268px] flex items-center justify-center text-center text-muted-foreground p-8">
            <p>Move your avatar closer to Alex or another player to interact with them.</p>
        </div>
      );
  }

  return (
    <SidebarProvider>
    <div className="w-screen h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      <div className="flex-grow relative order-2 md:order-1 h-1/2 md:h-full">
       {currentUser && <PhaserContainer 
            user={{
              id: currentUser.id,
              email: currentUser.email,
              role: currentUser.role,
              last_x: currentUser.last_x,
              last_y: currentUser.last_y,
            }}
            onPlayerNearNpc={handlePlayerNearNpc} 
            onPlayerFarNpc={handlePlayerFarNpc}
            onPlayerNear={handlePlayerNear}
            onPlayerFar={handlePlayerFar}
            onSceneReady={(scene) => sceneRef.current = scene} 
        />}
      </div>
      <Sidebar collapsible="offcanvas" side="right" className="w-full md:w-80 lg:w-96 border-l bg-card p-0 flex flex-col gap-0 order-1 md:order-2 shrink-0 h-1/2 md:h-full">
        <SidebarHeader>
            <div className="flex justify-between items-center p-4">
                <div>
                <CardTitle>SyncroSpace</CardTitle>
                <CardDescription>Your virtual commons room.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <LogoutButton />
                    <SidebarTrigger className="md:hidden" />
                </div>
            </div>
            <div className="px-4">
                <div className="p-1 bg-muted rounded-md flex items-center gap-1">
                     <Button 
                        variant={activeRightPanel === 'chat' ? 'primary' : 'ghost'} 
                        className="flex-1"
                        onClick={() => setActiveRightPanel('chat')}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </Button>
                    <Button 
                        variant={activeRightPanel === 'announcements' ? 'primary' : 'ghost'} 
                        className="flex-1"
                        onClick={() => setActiveRightPanel('announcements')}
                    >
                       <Rss className="mr-2 h-4 w-4" /> Announcements
                    </Button>
                </div>
            </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent className="p-0 flex-grow flex flex-col min-h-0">
             {activeRightPanel === 'chat' && (
                <div className="h-full flex flex-col">
                    <div className="p-4">
                        {renderInteractionPanel()}
                    </div>
                    <Separator />
                    <div className="p-4">
                        <AudioControl />
                    </div>
                    <Separator />
                    <UserList users={onlineUsers} />
                    <Chat messages={messages} onSendMessage={handleSendMessage} />
                </div>
             )}
             {activeRightPanel === 'announcements' && (
                <div className="h-full flex flex-col">
                    <Announcements />
                </div>
             )}

        </SidebarContent>
      </Sidebar>
    </div>
    </SidebarProvider>
  );
}

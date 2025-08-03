
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
import MediaControls from '@/components/world/MediaControls';
import type { MainScene } from '@/lib/phaser/scenes/MainScene';
import { useRouter } from 'next/navigation';
import AlexChat from '@/components/world/AlexChat';
import PlayerInteraction from '@/components/world/PlayerInteraction';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { MessageSquare, Rss, Loader2, Lock, Globe, Camera } from 'lucide-react';
import Announcements from '@/components/chat/Announcements';
import type { UserRole } from '@/models/User';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import UserVideo from '@/components/world/UserVideo';
import EmoteMenu from '@/components/world/EmoteMenu';
import { webRTCService } from '@/services/WebRTCService';
import { format } from 'date-fns';

const PhaserContainer = dynamic(() => import('@/components/world/PhaserContainer'), {
  ssr: false,
});

const WorldLoadingSkeleton = () => {
    return (
        <div className="w-screen h-screen overflow-hidden bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="text-muted-foreground">Entering SyncroSpace...</p>
            </div>
        </div>
    )
}

interface RemoteStream {
    clientId: string;
    stream: MediaStream;
    email: string;
}

export default function WorldPage() {
  const [isNearAlex, setIsNearAlex] = useState(false);
  const [nearbyPlayer, setNearbyPlayer] = useState<{ clientId: string; email: string } | null>(null);
  
  const [messages, setMessages] = useState<Record<string, Message[]>>({
      'pixel-space': [{ author: 'System', text: 'Welcome to SyncroSpace! Use WASD or arrow keys to move.' }]
  });

  const [onlineUsers, setOnlineUsers] = useState<Ably.Types.PresenceMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string, id: string, role: UserRole, last_x: number, last_y: number } | null>(null);
  const { toast } = useToast();
  const sceneRef = useRef<MainScene | null>(null);
  const router = useRouter();
  const [activeRightPanel, setActiveRightPanel] = useState('chat');
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [currentZone, setCurrentZone] = useState('pixel-space');
  const worldContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const getMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setHasMediaPermission(true);
            webRTCService.setLocalStream(stream);
        } catch (error) {
            console.error('Error accessing media devices.', error);
            setHasMediaPermission(false);
            toast({
                variant: 'destructive',
                title: 'Media Access Denied',
                description: 'Please enable camera and microphone permissions in your browser settings to use video and audio features.',
            });
        }
    };
    getMediaPermissions();

     // Set up WebRTC event handlers
    webRTCService.onRemoteStream((clientId, stream, clientEmail) => {
        console.log(`Received remote stream from ${clientId}`);
        setRemoteStreams(prev => {
            if (prev.some(s => s.clientId === clientId)) return prev;
            return [...prev, { clientId, stream, email: clientEmail }];
        });
    });

    webRTCService.onConnectionClose(clientId => {
        console.log(`Closing connection with ${clientId}`);
        setRemoteStreams(prev => prev.filter(s => s.clientId !== clientId));
    });

    return () => {
        webRTCService.closeAllConnections();
    };
  }, [toast]);


  useEffect(() => {
    const supabase = createClient();
    const fetchUserAndConnect = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const { data: userData, error } = await supabase.from('users').select('id, email, role, last_x, last_y').eq('id', session.user.id).single();
        if (error || !userData) {
            console.error("Failed to fetch user data", error);
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Could not fetch your profile.' });
            router.push('/login');
            return;
        }

        setCurrentUser(userData);
        await realtimeService.enterPresence({ email: userData.email, id: userData.id });
    }
    fetchUserAndConnect();

    const handleShowAnnouncements = () => {
        setActiveRightPanel('announcements');
        toast({ title: "Bulletin Board", description: "Showing latest announcements." });
    }
    window.addEventListener('show-announcements', handleShowAnnouncements);

    return () => {
        window.removeEventListener('show-announcements', handleShowAnnouncements);
        realtimeService.disconnect();
        if (localStream) { localStream.getTracks().forEach(track => track.stop()); }
        webRTCService.closeAllConnections();
    }
  }, [router, toast, localStream]);


  useEffect(() => {
    if (!currentUser) return;
    let isSubscribed = true;

    const handleNewMessage = (ablyMessage: Ably.Types.Message, channelId: string) => {
        if (!isSubscribed) return;
        const authorEmail = (ablyMessage.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        const newMessage = { author, text: ablyMessage.data.text };

        setMessages(prev => {
            const channelMessages = prev[channelId] || [];
            return { ...prev, [channelId]: [...channelMessages, newMessage] };
        });
    };
    
    const handlePresenceUpdate = (presenceMessage?: Ably.Types.PresenceMessage) => {
       if (!isSubscribed) return;
       realtimeService.getPresence('pixel-space', (err, members) => {
           if (!err && members) {
               setOnlineUsers(members);
               if (presenceMessage?.action === 'enter') {
                    const joinedEmail = (presenceMessage.data as PresenceData).email;
                    if (joinedEmail !== currentUser.email) {
                        toast({ title: 'User Joined', description: `${joinedEmail} has entered the space.` });
                    }
                } else if (presenceMessage?.action === 'leave') {
                    const leftEmail = (presenceMessage.data as PresenceData).email;
                    toast({ title: 'User Left', description: `${leftEmail} has left the space.` });
                    sceneRef.current?.removePlayer(presenceMessage.clientId);
                    webRTCService.closeConnection(presenceMessage.clientId);
                }
           }
       });
    };
    
    const handleHistory = (history: Ably.Types.Message[], channelId: string) => {
      if (!isSubscribed) return;
      const pastMessages: Message[] = history.map(message => {
        const authorEmail = (message.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        return { author, text: message.data.text };
      });
      setMessages(prev => ({ ...prev, [channelId]: [...pastMessages.reverse()] }));
    };
    
    const handlePlayerUpdate = (message: Ably.Types.Message) => {
        if (!isSubscribed) return;
        const data = message.data as PlayerUpdateData;
        if (data.payload.clientId !== currentUser.id) {
           sceneRef.current?.updatePlayer(data.payload.clientId, data.payload.x, data.payload.y, data.payload.email);
        }
    };
    
    const handleKnock = (data: KnockData) => {
        if (!isSubscribed) return;
        toast({ title: 'Someone is knocking!', description: `${data.fromEmail} is knocking.`, duration: 5000 });
    };

    realtimeService.onMessage(handleNewMessage);
    realtimeService.onPresenceUpdate('pixel-space', handlePresenceUpdate);
    realtimeService.onHistory(handleHistory);
    realtimeService.onPlayerUpdate(handlePlayerUpdate);
    realtimeService.onKnock(handleKnock);
    realtimeService.subscribeToChannels(['pixel-space'], currentUser.id);

    return () => { isSubscribed = false; };
  }, [currentUser, toast]);


  const handlePlayerNearNpc = useCallback(() => { setIsNearAlex(true); }, []);
  const handlePlayerFarNpc = useCallback(() => { setIsNearAlex(false); }, []);

  const handlePlayerNear = useCallback((clientId: string, email: string) => {
      setNearbyPlayer({ clientId, email });
      if (hasMediaPermission) {
          console.log(`Initiating call with ${clientId}`);
          webRTCService.call(clientId, email);
      }
  }, [hasMediaPermission]);

  const handlePlayerFar = useCallback(() => {
    if (nearbyPlayer) {
        webRTCService.closeConnection(nearbyPlayer.clientId);
    }
    setNearbyPlayer(null);
  }, [nearbyPlayer]);
  
  const handleSendMessage = useCallback((text: string) => {
    if (!currentUser) return;
    realtimeService.sendMessage(currentZone, text, { author: currentUser.email }, 'channel');
  }, [currentUser, currentZone]);

  const handleZoneChange = useCallback((zoneId: string) => {
    realtimeService.subscribeToChannels([zoneId], currentUser!.id);
    setCurrentZone(zoneId);
    if (!messages[zoneId]) {
      setMessages(prev => ({ ...prev, [zoneId]: [{ author: 'System', text: `You have entered ${zoneId}.`}] }));
    }
  }, [currentUser, messages]);

  const onFollowPlayer = (clientId: string) => {
    if (sceneRef.current) {
      sceneRef.current.followPlayer(clientId);
      toast({ title: `Following ${nearbyPlayer?.email}`});
    }
  }

  const onEmote = (emote: string) => {
     if (sceneRef.current) {
      sceneRef.current.showEmote(emote);
    }
  }

  const handleScreenshot = () => {
    const worldEl = worldContainerRef.current;
    const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
    const emoteMenuEl = document.querySelector('.absolute.bottom-4.right-4');

    if (!worldEl || !sceneRef.current?.game.canvas) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not capture screenshot.' });
      return;
    }

    // Hide UI elements
    if (sidebarEl) (sidebarEl as HTMLElement).style.display = 'none';
    if (emoteMenuEl) (emoteMenuEl as HTMLElement).style.display = 'none';

    setTimeout(() => {
      const canvas = sceneRef.current!.game.canvas;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `syncrospace-moment-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.png`;
      link.href = dataUrl;
      link.click();

      // Restore UI elements
      if (sidebarEl) (sidebarEl as HTMLElement).style.display = '';
      if (emoteMenuEl) (emoteMenuEl as HTMLElement).style.display = '';

      toast({ title: 'Screenshot Saved!', description: 'Your moment has been captured.' });
    }, 100); // Small delay to allow UI to hide
  };

  const renderInteractionPanel = () => {
      if (isNearAlex) { return <AlexChat />; }
      if (nearbyPlayer) {
          return <PlayerInteraction 
                    player={nearbyPlayer} 
                    onKnock={(targetClientId) => {
                        if (currentUser) {
                           realtimeService.sendKnock(targetClientId, currentUser.email);
                           toast({ title: `You knocked on ${nearbyPlayer.email}!`});
                        }
                    }}
                    onFollow={() => onFollowPlayer(nearbyPlayer.clientId)}
                 />;
      }
      return (
          <div className="h-[268px] flex items-center justify-center text-center text-muted-foreground p-8">
            <p>Move your avatar closer to Alex or another player to interact with them.</p>
        </div>
      );
  }
  
  if (!currentUser) { return <WorldLoadingSkeleton />; }
  const userList = onlineUsers.map(u => ({ clientId: u.clientId, email: (u.data as PresenceData).email })).filter(Boolean);
  const currentMessages = messages[currentZone] || [];
  const isPrivateZone = currentZone !== 'pixel-space';

  return (
    <SidebarProvider>
    <div className="w-screen h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      <div ref={worldContainerRef} className="flex-grow relative order-2 md:order-1 h-1/2 md:h-full">
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
            onZoneChange={handleZoneChange}
            onSceneReady={(scene) => sceneRef.current = scene} 
        />}

        {/* Local Video Preview */}
        {localStream && <UserVideo stream={localStream} muted={true} isLocal={true} />}

        {/* Remote Video Streams */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {remoteStreams.map(({ clientId, stream, email }) => (
                <UserVideo key={clientId} stream={stream} muted={false} email={email} />
            ))}
        </div>

        <div className="absolute bottom-4 right-20 z-20 flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12 shadow-lg" onClick={handleScreenshot}>
                <Camera className="h-6 w-6" />
                <span className="sr-only">Take Screenshot</span>
            </Button>
            <EmoteMenu onEmote={onEmote} />
        </div>
      </div>
      <Sidebar collapsible="offcanvas" side="right" className="w-full md:w-80 lg:w-96 border-l bg-card p-0 flex flex-col gap-0 order-1 md:order-2 shrink-0 h-1/2 md:h-full">
        <SidebarHeader>
            <div className="flex justify-between items-center p-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                      {isPrivateZone ? <Lock className="text-accent h-5 w-5"/> : <Globe className="text-accent h-5 w-5"/>}
                      {isPrivateZone ? 'Private Zone' : 'SyncroSpace'}
                  </CardTitle>
                  <CardDescription>
                      {isPrivateZone ? 'Your conversation here is private.' : 'Your virtual commons room.'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <LogoutButton />
                    <SidebarTrigger className="md:hidden" />
                </div>
            </div>
            <div className="px-4">
                <div className="p-1 bg-muted rounded-md flex items-center gap-1">
                     <Button 
                        variant={activeRightPanel === 'chat' ? 'default' : 'ghost'} 
                        className="flex-1"
                        onClick={() => setActiveRightPanel('chat')}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </Button>
                    <Button 
                        variant={activeRightPanel === 'announcements' ? 'default' : 'ghost'} 
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
                        <MediaControls stream={localStream} hasPermission={hasMediaPermission} />
                    </div>
                    <Separator />
                    <UserList users={userList} onFollow={onFollowPlayer} />
                    <Chat messages={currentMessages} onSendMessage={handleSendMessage} />
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

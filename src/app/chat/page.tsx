
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Search,
  MessageSquare,
  Settings,
  MoreHorizontal,
  FileText,
  Loader2,
  Smile,
  Paperclip,
  Rss,
  Hand,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { summarizeChat } from '@/ai/flows/summarize-chat';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Announcements from '@/components/chat/Announcements';
import { Skeleton } from '@/components/ui/skeleton';
import { realtimeService, type PresenceData, type MessageData } from '@/services/RealtimeService';
import type * as Ably from 'ably';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ChatMessage extends MessageData {
  id?: string;
  clientId?: string;
}

interface ChatUser {
    id: string;
    email: string;
    role: string;
}

const sampleChannels = [
    { id: 'general', name: '#general', status: 'Charlie: See you there!' },
    { id: 'design-team', name: '#design-team', status: 'Bob: Latest mockups are up.' },
    { id: 'project-phoenix', name: '#project-phoenix', status: 'Alice: We hit our milestone!' },
];

const emojis = ['😀', '😂', '👍', '❤️', '🙏', '🎉', '🔥', '🚀'];


export default function ChatPage() {
  const [activeView, setActiveView] = React.useState('messages');
  const [activeConversation, setActiveConversation] = React.useState('general');
  const [conversationType, setConversationType] = React.useState<'channel' | 'dm'>('channel');
  const [users, setUsers] = React.useState<ChatUser[]>([]);
  const [onlineUsers, setOnlineUsers] = React.useState<Ably.Types.PresenceMessage[]>([]);
  const [currentUser, setCurrentUser] = React.useState<ChatUser | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);


  React.useEffect(() => {
    const supabase = createClient();

    const fetchInitialData = async () => {
        setIsLoadingUsers(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            
            const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            if (userError) throw userError;
            setCurrentUser(userData);

            const { data: allUsers, error: allUsersError } = await fetch('/api/users');
            if (allUsersError) throw allUsersError;
            const allUsersData = await allUsers.json();
            setUsers(allUsersData.filter((u: ChatUser) => u.id !== session.user.id));
            
            await realtimeService.enterPresence({ email: userData.email });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load user list.'});
        } finally {
            setIsLoadingUsers(false);
        }
    }
    fetchInitialData();
  }, [router, toast]);

  React.useEffect(() => {
    if (!currentUser) return;
    let isSubscribed = true;

    const handleNewMessage = (message: Ably.Types.Message) => {
        if (!isSubscribed) return;
        const authorEmail = (message.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        setMessages((prev) => [...prev, { id: message.id, author, text: message.data.text, clientId: message.clientId }]);
    };

     const handleHistory = (history: Ably.Types.Message[]) => {
      if (!isSubscribed) return;
      const pastMessages: ChatMessage[] = history.map(message => {
        const authorEmail = (message.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        return { id: message.id, author, text: message.data.text, clientId: message.clientId };
      });
      setMessages(prev => [...pastMessages.reverse()]);
    };

    const handlePresenceUpdate = (presenceMessage?: Ably.Types.PresenceMessage) => {
       realtimeService.pixelSpaceChannel.presence.get((err, members) => {
           if (!err && members) {
               setOnlineUsers(members);
           }
       });
    };
    
    realtimeService.onMessage(handleNewMessage);
    realtimeService.onHistory(handleHistory);
    realtimeService.onInitialUsers(handlePresenceUpdate);
    realtimeService.onUserJoined(handlePresenceUpdate);
    realtimeService.onUserLeft(handlePresenceUpdate);

    realtimeService.subscribeToEvents();

    return () => {
        isSubscribed = false;
        realtimeService.disconnect();
    }
  }, [currentUser]);
  
  const handleSendMessage = (text: string) => {
    if (text.trim() && currentUser) {
        realtimeService.sendMessage(text, { author: currentUser.email });
        setMessage('');
    }
  };


  const handleSummarize = async () => {
    setIsSummarizing(true);
    if (messages.length === 0) {
        toast({ title: "Not enough messages", description: "There's nothing to summarize yet."});
        setIsSummarizing(false);
        return;
    }

    try {
        const result = await summarizeChat({ messages: messages.map(m => ({ author: m.author, text: m.text })) });
        setSummary(result.summary);
        setIsSummaryDialogOpen(true);
    } catch (error) {
        console.error("Failed to summarize chat", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not generate a summary. Please try again later.'
        });
    } finally {
        setIsSummarizing(false);
    }
  };

  const getActiveConversationName = () => {
    if (conversationType === 'channel') {
        const channel = sampleChannels.find(c => c.id === activeConversation);
        return channel?.name || 'Chat';
    }
    const user = users.find(u => u.id === activeConversation);
    return user?.email || 'Chat';
  }
  
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        toast({
            title: "Attachment Selected",
            description: `${file.name} is ready to be sent. (Feature not fully implemented)`,
        });
    }
  };
  
  const handleKnock = (user: ChatUser) => {
      if (!currentUser) return;
      realtimeService.sendKnock(user.id, currentUser.email);
      toast({
          title: "Knock, knock!",
          description: `You sent a knock to ${user.email}.`
      })
  }
  
  const getOnlineStatus = (userId: string) => {
    return onlineUsers.some(member => member.clientId === userId);
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="border-r hidden md:flex"
        >
          <SidebarHeader>
             <Avatar className="size-8">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="User Avatar" />
                <AvatarFallback>{currentUser?.email.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'messages'}
                    onClick={() => setActiveView('messages')}
                    tooltip={{
                        children: 'Messages',
                    }}
                >
                  <MessageSquare />
                   <span>Messages</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'announcements'}
                    onClick={() => setActiveView('announcements')}
                    tooltip={{
                        children: 'Announcements',
                    }}
                >
                  <Rss />
                   <span>Announcements</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                     <SidebarMenuButton
                        tooltip={{
                            children: 'Settings',
                        }}
                    >
                      <Settings />
                       <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {activeView === 'messages' && (
        <>
            <Sidebar collapsible="offcanvas" className="w-full md:w-80 md:border-r flex-col flex shrink-0">
                 <SidebarHeader>
                     <div className="flex justify-between items-center mb-4 p-4 md:p-2">
                        <h1 className="text-2xl font-bold">Chats</h1>
                        <div className='flex gap-2'>
                          <Button variant="ghost" size="icon">
                              <Search className="size-5"/>
                          </Button>
                          <SidebarTrigger className='md:hidden' />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-0">
                    <SidebarGroup className="p-2">
                        <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                        <SidebarMenu>
                            {isLoadingUsers ? (
                                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
                            ) : (
                                users.map(user => (
                                    <SidebarMenuItem key={user.id}>
                                        <SidebarMenuButton size="lg" isActive={activeConversation === user.id} onClick={() => { setActiveConversation(user.id); setConversationType('dm'); }}>
                                            <div className="relative">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="avatar" alt={user.email} />
                                                    <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                {getOnlineStatus(user.id) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />}
                                            </div>
                                            <div className="flex flex-col items-start text-left">
                                                <span>{user.email}</span>
                                                <span className="text-xs text-muted-foreground">{user.role}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                    <SidebarGroup className="p-2">
                        <SidebarGroupLabel>Channels</SidebarGroupLabel>
                        <SidebarMenu>
                            {sampleChannels.map(channel => (
                                <SidebarMenuItem key={channel.id}>
                                    <SidebarMenuButton size="lg" isActive={activeConversation === channel.id} onClick={() => { setActiveConversation(channel.id); setConversationType('channel'); }}>
                                        <div className="p-2 bg-muted rounded-md mr-2">
                                            <MessageSquare className="size-4"/>
                                        </div>
                                    <div className="flex flex-col items-start text-left">
                                            <span>{channel.name}</span>
                                            <span className="text-xs text-muted-foreground">{channel.status}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <SidebarInset className="flex-grow flex flex-col h-screen">
                <header className="p-4 border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className='md:hidden' />
                        <Avatar className="size-9">
                            <AvatarImage src={conversationType === 'dm' ? 'https://placehold.co/40x40.png' : undefined} data-ai-hint="avatar" />
                            <AvatarFallback>{conversationType === 'channel' ? '#' : getActiveConversationName().charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-lg">{getActiveConversationName()}</h2>
                            <p className="text-sm text-muted-foreground">Real-time chat enabled</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {conversationType === 'dm' && (
                             <Button variant="outline" size="sm" onClick={() => handleKnock(users.find(u => u.id === activeConversation)!)}>
                                <Hand className="mr-2 h-4 w-4" /> Knock
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}>
                            {isSummarizing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Summarize</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-5"/>
                        </Button>
                    </div>
                </header>
                <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                         <div key={msg.id || index} className="flex items-start gap-3">
                            <Avatar className="size-9">
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="avatar" alt={msg.author} />
                                <AvatarFallback>{msg.author.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold">{msg.author}</span>
                                    <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                                </div>
                                <div className={`p-3 rounded-lg mt-1 ${msg.author === 'You' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
                <footer className="p-4 border-t shrink-0">
                    <div className="relative">
                        <Input 
                            placeholder={`Message ${getActiveConversationName()}`} 
                            className="w-full pr-24"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(message);
                                }
                            }}
                        />
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Smile className="size-5" />
                                        <span className="sr-only">Add emoji</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="grid grid-cols-4 gap-2">
                                        {emojis.map(emoji => (
                                            <Button 
                                                key={emoji} 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-xl"
                                                onClick={() => setMessage(prev => prev + emoji)}
                                            >
                                                {emoji}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            
                            <input type="file" ref={fileInputRef} onChange={handleAttachment} className="hidden" />
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="size-5" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </div>
                    </div>
                </footer>
            </SidebarInset>
        </>
        )}

        {activeView === 'announcements' && (
            <SidebarInset>
                <Announcements />
            </SidebarInset>
        )}
        
        <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <FileText /> Chat Summary
                    </AlertDialogTitle>
                    <AlertDialogDescription
                        asChild
                        className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto"
                    >
                     <div dangerouslySetInnerHTML={{ __html: summary.replace(/\\n/g, '<br />') }} />
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </SidebarProvider>
  );
}

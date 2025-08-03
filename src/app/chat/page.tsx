
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInset,
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
  Plus,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { summarizeChat } from '@/ai/flows/summarize-chat';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Announcements from '@/components/chat/Announcements';
import { Skeleton } from '@/components/ui/skeleton';
import { realtimeService, type MessageData } from '@/services/RealtimeService';
import type * as Ably from 'ably';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';

interface ChatMessage extends MessageData {
  id?: string;
  clientId?: string;
}

interface ChatUser {
    id: string;
    email: string;
    role: string;
}

interface ChatChannel {
    id: string;
    name: string;
    description: string | null;
}

const emojis = ['😀', '😂', '👍', '❤️', '🙏', '🎉', '🔥', '🚀'];


export default function ChatPage() {
  const [activeView, setActiveView] = React.useState('messages');
  const [activeConversation, setActiveConversation] = React.useState('general'); // Default to 'general' channel id
  const [conversationType, setConversationType] = React.useState<'channel' | 'dm'>('channel');
  
  const [users, setUsers] = React.useState<ChatUser[]>([]);
  const [channels, setChannels] = React.useState<ChatChannel[]>([]);
  
  const [onlineUsers, setOnlineUsers] = React.useState<Ably.Types.PresenceMessage[]>([]);
  const [currentUser, setCurrentUser] = React.useState<ChatUser | null>(null);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreatingChannel, setIsCreatingChannel] = React.useState(false);
  const [isNewChannelDialogOpen, setIsNewChannelDialogOpen] = React.useState(false);

  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [messages, setMessages] = React.useState<Record<string, ChatMessage[]>>({});


  const fetchInitialData = React.useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }
        
        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (userError) throw userError;
        setCurrentUser(userData);

        const [usersResponse, channelsResponse] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/chat/channels')
        ]);
        if (!usersResponse.ok) throw new Error('Could not fetch users');
        if (!channelsResponse.ok) throw new Error('Could not fetch channels');

        const allUsersData = await usersResponse.json();
        setUsers(allUsersData.filter((u: ChatUser) => u.id !== session.user.id));
        
        const channelsData = await channelsResponse.json();
        setChannels(channelsData);

        // Set default channel if available
        const generalChannel = channelsData.find((c: ChatChannel) => c.name === 'general');
        if (generalChannel) {
            setActiveConversation(generalChannel.id);
        } else if (channelsData.length > 0) {
            setActiveConversation(channelsData[0].id);
        }

        await realtimeService.enterPresence({ email: userData.email, id: userData.id });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load chat data.'});
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, [router, toast]);


  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  React.useEffect(() => {
    if (!currentUser || channels.length === 0) return;

    const handleNewMessage = (ablyMessage: Ably.Types.Message, channelId: string) => {
        const authorEmail = (ablyMessage.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        const newMessage: ChatMessage = { id: ablyMessage.id, author, text: ablyMessage.data.text, clientId: ablyMessage.clientId };
        
        setMessages(prev => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), newMessage]
        }));
    };

    const handleHistory = (history: Ably.Types.Message[], channelId: string) => {
      const pastMessages: ChatMessage[] = history.map(message => {
        const authorEmail = (message.data.author || 'Anonymous');
        const author = authorEmail === currentUser.email ? 'You' : authorEmail;
        return { id: message.id, author, text: message.data.text, clientId: message.clientId };
      });
      setMessages(prev => ({
        ...prev,
        [channelId]: [...pastMessages.reverse(), ...(prev[channelId] || [])]
      }));
    };

    const handlePresenceUpdate = (presenceMessage?: Ably.Types.PresenceMessage) => {
       realtimeService.getPresence('pixel-space', (err, members) => {
           if (!err && members) {
               setOnlineUsers(members);
           }
       });
    };
    
    realtimeService.onMessage(handleNewMessage);
    realtimeService.onHistory(handleHistory);
    realtimeService.onPresenceUpdate('pixel-space', handlePresenceUpdate);
    
    const dmUserIds = users.map(u => u.id);
    const channelIds = channels.map(c => c.id);
    realtimeService.subscribeToChannels([...channelIds, ...dmUserIds], currentUser.id);

    return () => {
        realtimeService.disconnect();
    }
  }, [currentUser, users, channels]);
  
  const handleSendMessage = (text: string) => {
    if (text.trim() && currentUser) {
        let channelId = activeConversation;
        // The service already handles DM channel ID logic, so we pass the other user's ID
        realtimeService.sendMessage(channelId, text, { author: currentUser.email }, conversationType);
        setMessage('');
    }
  };


  const handleSummarize = async () => {
    setIsSummarizing(true);
    const currentMessages = messages[activeConversation] || [];

    if (currentMessages.length === 0) {
        toast({ title: "Not enough messages", description: "There's nothing to summarize yet."});
        setIsSummarizing(false);
        return;
    }

    try {
        const result = await summarizeChat({ messages: currentMessages.map(m => ({ author: m.author, text: m.text })) });
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
  
  const handleConversationSelect = (id: string, type: 'channel' | 'dm') => {
      setActiveConversation(id);
      setConversationType(type);
      setMessages(prev => ({ ...prev, [id]: [] })); // Clear messages for new channel
      realtimeService.fetchHistory(id, type);
  }
  
  const handleCreateChannel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingChannel(true);
    const form = event.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.toLowerCase().replace(/\s+/g, '-');
    const description = (form.elements.namedItem('description') as HTMLInputElement).value;

    try {
        const response = await fetch('/api/chat/channels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        const newChannel = await response.json();
        if (!response.ok) throw new Error(newChannel.error || 'Failed to create channel');
        
        setChannels(prev => [...prev, newChannel]);
        handleConversationSelect(newChannel.id, 'channel');
        toast({ title: 'Channel Created!', description: `#${newChannel.name} is ready.` });
        setIsNewChannelDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsCreatingChannel(false);
    }
  }


  const getActiveConversationName = () => {
    if (conversationType === 'channel') {
        const channel = channels.find(c => c.id === activeConversation);
        return channel ? `#${channel.name}` : 'Chat';
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

  const currentMessages = messages[activeConversation] || [];


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
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
                            ) : (
                                users.map(user => (
                                    <SidebarMenuItem key={user.id}>
                                        <SidebarMenuButton size="lg" isActive={activeConversation === user.id && conversationType === 'dm'} onClick={() => handleConversationSelect(user.id, 'dm')}>
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
                        <div className="flex items-center justify-between">
                            <SidebarGroupLabel>Channels</SidebarGroupLabel>
                             <Dialog open={isNewChannelDialogOpen} onOpenChange={setIsNewChannelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Plus className="size-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Channel</DialogTitle>
                                        <DialogDescription>Channels are for team-wide conversations.</DialogDescription>
                                    </DialogHeader>
                                    <form id="new-channel-form" onSubmit={handleCreateChannel}>
                                        <div className="grid gap-4 py-4">
                                            <div>
                                                <Label htmlFor="name">Channel Name</Label>
                                                <Input id="name" name="name" placeholder="e.g. marketing" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">Description (Optional)</Label>
                                                <Input id="description" name="description" placeholder="What is this channel about?" />
                                            </div>
                                        </div>
                                    </form>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                        <Button type="submit" form="new-channel-form" disabled={isCreatingChannel}>
                                            {isCreatingChannel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                        </div>
                        <SidebarMenu>
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
                            ) : (
                                channels.map(channel => (
                                <SidebarMenuItem key={channel.id}>
                                    <SidebarMenuButton size="lg" isActive={activeConversation === channel.id && conversationType === 'channel'} onClick={() => handleConversationSelect(channel.id, 'channel')}>
                                        <div className="p-2 bg-muted rounded-md mr-2">
                                            <span className="font-mono text-muted-foreground">#</span>
                                        </div>
                                    <div className="flex flex-col items-start text-left">
                                            <span>{channel.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">{channel.description}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )))}
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
                            <AvatarFallback>{getActiveConversationName().charAt(0).toUpperCase()}</AvatarFallback>
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
                    {currentMessages.length === 0 && !isLoading && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {isLoading && currentMessages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}
                    {currentMessages.map((msg, index) => (
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

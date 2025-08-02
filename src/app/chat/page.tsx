
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  MessageSquare,
  Settings,
  MoreHorizontal,
  FileText,
  Loader2,
  Smile,
  Paperclip,
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
import { summarizeChat, type ChatMessage } from '@/ai/flows/summarize-chat';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';


const sampleUsers = [
    { id: 'alice', name: 'Alice', status: 'typing...' },
    { id: 'bob', name: 'Bob', status: 'Hey, how are you?' },
];

const sampleChannels = [
    { id: 'general', name: '#general', status: 'Charlie: See you there!' }
];

const sampleMessages: ChatMessage[] = [
    { author: 'Charlie', text: 'Project stand-up in 15 minutes in the Focus Zone!' },
    { author: 'You', text: 'On my way!' },
    { author: 'Alice', text: 'I might be a few minutes late, wrapping something up.' },
    { author: 'You', text: 'No problem, see you there.' },
    { author: 'Bob', text: "Should I bring my laptop?"},
    { author: 'Charlie', text: "Yes, we'll be reviewing the latest designs."}
];

const emojis = ['😀', '😂', '👍', '❤️', '🙏', '🎉', '🔥', '🚀'];


export default function ChatPage() {
  const [activeConversation, setActiveConversation] = React.useState('general');
  const [conversationType, setConversationType] = React.useState<'channel' | 'dm'>('channel');
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
        const result = await summarizeChat({ messages: sampleMessages });
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
    const user = sampleUsers.find(u => u.id === activeConversation);
    return user?.name || 'Chat';
  }
  
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        // In a real app, you'd upload this file and get a URL.
        // For this demo, we'll just show a toast.
        toast({
            title: "Attachment Selected",
            description: `${file.name} is ready to be sent. (Feature not fully implemented)`,
        });
    }
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="border-r"
        >
          <SidebarHeader>
             <Avatar className="size-8">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton
                    isActive
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
                    tooltip={{
                        children: 'Team',
                    }}
                >
                  <Users />
                   <span>Team</span>
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

        <div className="w-80 border-r p-4 flex-col flex">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chats</h1>
                <Button variant="ghost" size="icon">
                    <Search className="size-5"/>
                </Button>
            </div>
            <SidebarGroup>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                 <SidebarMenu>
                    {sampleUsers.map(user => (
                        <SidebarMenuItem key={user.id}>
                            <SidebarMenuButton size="lg" isActive={activeConversation === user.id} onClick={() => { setActiveConversation(user.id); setConversationType('dm'); }}>
                                <Avatar className="size-8">
                                    <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="avatar" alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start">
                                    <span>{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.status}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
             <SidebarGroup>
                <SidebarGroupLabel>Channels</SidebarGroupLabel>
                 <SidebarMenu>
                     {sampleChannels.map(channel => (
                        <SidebarMenuItem key={channel.id}>
                            <SidebarMenuButton size="lg" isActive={activeConversation === channel.id} onClick={() => { setActiveConversation(channel.id); setConversationType('channel'); }}>
                                <div className="p-2 bg-muted rounded-md mr-2">
                                    <MessageSquare className="size-4"/>
                                </div>
                               <div className="flex flex-col items-start">
                                    <span>{channel.name}</span>
                                    <span className="text-xs text-muted-foreground">{channel.status}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
            </SidebarGroup>
        </div>

        <SidebarInset className="flex-grow flex flex-col">
           <div className="flex-grow flex flex-col">
            <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarImage src={conversationType === 'dm' ? 'https://placehold.co/40x40.png' : ''} />
                        <AvatarFallback>{conversationType === 'channel' ? '#' : getActiveConversationName().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">{getActiveConversationName()}</h2>
                        <p className="text-sm text-muted-foreground">3 members</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}>
                        {isSummarizing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Summarize
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-5"/>
                    </Button>
                </div>
            </header>
            <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                 {/* Chat messages will go here */}
                <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male avatar" alt="Charlie" />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">Charlie</span>
                            <span className="text-xs text-muted-foreground">3:45 PM</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg mt-1">
                            <p>Project stand-up in 15 minutes in the Focus Zone!</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="You" />
                        <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">You</span>
                            <span className="text-xs text-muted-foreground">3:46 PM</span>
                        </div>
                        <div className="p-3 bg-primary text-primary-foreground rounded-lg mt-1">
                            <p>On my way!</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="female avatar" alt="Alice" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">Alice</span>
                            <span className="text-xs text-muted-foreground">3:47 PM</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg mt-1">
                            <p>I might be a few minutes late, wrapping something up.</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="You" />
                        <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">You</span>
                            <span className="text-xs text-muted-foreground">3:47 PM</span>
                        </div>
                        <div className="p-3 bg-primary text-primary-foreground rounded-lg mt-1">
                            <p>No problem, see you there.</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male avatar" alt="Bob" />
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">Bob</span>
                            <span className="text-xs text-muted-foreground">3:48 PM</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg mt-1">
                            <p>Should I bring my laptop?</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Avatar className="size-9">
                         <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male avatar" alt="Charlie" />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold">Charlie</span>
                            <span className="text-xs text-muted-foreground">3:49 PM</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg mt-1">
                            <p>Yes, we'll be reviewing the latest designs.</p>
                        </div>
                        <div className="p-2 bg-secondary rounded-lg mt-2 w-fit">
                           <Image src="https://placehold.co/300x200.png" width={300} height={200} alt="Latest design mockup" data-ai-hint="design mockup" className="rounded-md" />
                           <p className="text-xs text-muted-foreground mt-1">latest_designs.png</p>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="p-4 border-t">
                <div className="relative">
                    <Input 
                        placeholder={`Message ${getActiveConversationName()}`} 
                        className="w-full pr-24"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                // handleSendMessage(message);
                                setMessage('');
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
        </div>
        </SidebarInset>
        
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
                     <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
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

    
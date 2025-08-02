
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Search,
  Users,
  MessageSquare,
  Settings,
  MoreHorizontal,
  FileText,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Announcements from '@/components/chat/Announcements';
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


const sampleMessages: ChatMessage[] = [
    { author: 'Charlie', text: 'Project stand-up in 15 minutes in the Focus Zone!' },
    { author: 'You', text: 'On my way!' },
    { author: 'Alice', text: 'I might be a few minutes late, wrapping something up.' },
    { author: 'You', text: 'No problem, see you there.' },
    { author: 'Bob', text: "Should I bring my laptop?"},
    { author: 'Charlie', text: "Yes, we'll be reviewing the latest designs."}
];

export default function ChatPage() {
  const [activeView, setActiveView] = React.useState('messages');
  const [activeConversation, setActiveConversation] = React.useState(
    'general'
  );
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);

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


  const renderContent = () => {
    if (activeView === 'announcements') {
        return <Announcements />;
    }
    // Default to messages view
    return (
         <div className="flex-grow flex flex-col">
            <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarImage src={activeConversation === 'alice' ? 'https://placehold.co/40x40.png' : activeConversation === 'bob' ? 'https://placehold.co/40x40.png' : ''} />
                        <AvatarFallback>{activeConversation === 'general' ? '#' : activeConversation.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">{activeConversation === 'general' ? '#general' : activeConversation}</h2>
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
                    </div>
                </div>
            </main>
            <footer className="p-4 border-t">
                 <Input placeholder={`Message ${activeConversation === 'general' ? '#general' : activeConversation}`} className="w-full"/>
            </footer>
        </div>
    );
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
                    onClick={() => setActiveView('announcements')}
                    isActive={activeView === 'announcements'}
                    tooltip={{
                        children: 'Notifications',
                    }}
                >
                  <Bell />
                  <span>Notifications</span>
                   <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setActiveView('messages')}
                    isActive={activeView === 'messages'}
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

        <div className="w-80 border-r p-4 flex-col" style={{ display: activeView === 'messages' ? 'flex' : 'none' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chats</h1>
                <Button variant="ghost" size="icon">
                    <Search className="size-5"/>
                </Button>
            </div>
            <SidebarGroup>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" isActive={activeConversation === 'alice'} onClick={() => setActiveConversation('alice')}>
                            <Avatar className="size-8">
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="female avatar" alt="Alice" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span>Alice</span>
                                <span className="text-xs text-muted-foreground">typing...</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" isActive={activeConversation === 'bob'} onClick={() => setActiveConversation('bob')}>
                             <Avatar className="size-8">
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male avatar" alt="Bob" />
                                <AvatarFallback>B</AvatarFallback>
                            </Avatar>
                           <div className="flex flex-col items-start">
                                <span>Bob</span>
                                <span className="text-xs text-muted-foreground">Hey, how are you?</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
             <SidebarGroup>
                <SidebarGroupLabel>Channels</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" isActive={activeConversation === 'general'} onClick={() => setActiveConversation('general')}>
                            <div className="p-2 bg-muted rounded-md mr-2">
                                <MessageSquare className="size-4"/>
                            </div>
                           <div className="flex flex-col items-start">
                                <span>#general</span>
                                <span className="text-xs text-muted-foreground">Charlie: See you there!</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </SidebarGroup>
        </div>

        <SidebarInset className="flex-grow flex flex-col">
            {renderContent()}
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

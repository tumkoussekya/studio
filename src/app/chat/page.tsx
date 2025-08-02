
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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Search,
  Users,
  MessageSquare,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = React.useState(
    'general'
  );
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
                    tooltip={{
                        children: 'Messages',
                    }}
                    isActive={true}
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

        <div className="w-80 border-r p-4 flex flex-col">
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
            <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarFallback>#</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">#general</h2>
                        <p className="text-sm text-muted-foreground">3 members</p>
                    </div>
                </div>
                 <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-5"/>
                </Button>
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
            </main>
            <footer className="p-4 border-t">
                 <Input placeholder="Message #general" className="w-full"/>
            </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

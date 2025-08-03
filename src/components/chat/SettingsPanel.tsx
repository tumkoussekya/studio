
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ChatDensity } from '@/app/chat/page';
import { Button } from '../ui/button';
import { User, Bell, Palette, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  chatDensity: ChatDensity;
  setChatDensity: (density: ChatDensity) => void;
}

export default function SettingsPanel({ chatDensity, setChatDensity }: SettingsPanelProps) {
  const { toast } = useToast();

  const handleClearCache = () => {
    toast({
        title: "Action Not Implemented",
        description: "This is a placeholder for clearing local chat data."
    });
  }
  
  return (
    <div className="flex flex-col h-full bg-secondary/30">
        <header className="p-4 border-b bg-background">
             <h1 className="text-2xl font-bold">Settings</h1>
        </header>
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <User className="h-6 w-6 text-accent" />
                        <div>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your personal information and account settings.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/profile">
                            <Button variant="outline">Edit Profile</Button>
                        </Link>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Palette className="h-6 w-6 text-accent" />
                        <div>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize how the chat interface looks and feels.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                        <Label>Chat Density</Label>
                        <RadioGroup
                          value={chatDensity}
                          onValueChange={(value: ChatDensity) => setChatDensity(value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cozy" id="cozy" />
                            <Label htmlFor="cozy" className="font-normal">Cozy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="compact" id="compact" />
                            <Label htmlFor="compact" className="font-normal">Compact</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Bell className="h-6 w-6 text-accent" />
                        <div>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Control how you receive alerts for new messages.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <Label>Desktop Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications for new messages.
                            </p>
                            </div>
                            <Switch
                            // In a real app, this would be tied to state and a service
                            // For now, it's just a functional UI element
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Trash2 className="h-6 w-6 text-destructive" />
                        <div>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Manage your local application data.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Button variant="destructive" onClick={handleClearCache}>Clear Local Chat Cache</Button>
                         <p className="text-xs text-muted-foreground mt-2">This is a placeholder and won't delete any data.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  )
}

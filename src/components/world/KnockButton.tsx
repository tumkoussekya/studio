
'use client';

import { Button } from "@/components/ui/button";
import { Hand, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestConversationStarter } from "@/ai/flows/suggest-conversation-starter";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";


interface KnockButtonProps {
    player: {
        clientId: string;
        email: string;
    };
    onKnock: (targetClientId: string) => void;
    onFollow: (targetClientId: string) => void;
}

export default function KnockButton({ player, onKnock, onFollow }: KnockButtonProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

     const handleGenerateIcebreaker = async () => {
        setIsLoading(true);
        try {
            const result = await suggestConversationStarter({
                userContext: 'A software engineer who loves hiking and trying new coffee shops.',
                otherUserContext: 'A graphic designer who is into photography and vintage films.',
            });

            toast({
                title: "Icebreaker Suggestion ✨",
                description: result.conversationStarter,
                duration: 9000,
            });
        } catch (error) {
            console.error('AI Error:', error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not generate a suggestion. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="bg-secondary/50 border-dashed h-[268px] md:h-auto">
            <CardHeader>
                <CardTitle className="text-lg">You're near {player.email}!</CardTitle>
                <CardDescription>Break the ice or just say hello.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => onKnock(player.clientId)} variant="outline">
                    <Hand className="mr-2 h-4 w-4" />
                    Knock
                </Button>
                <Button onClick={() => onFollow(player.clientId)} variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                </Button>
                <div className="sm:col-span-2">
                    <Button onClick={handleGenerateIcebreaker} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI Icebreaker
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

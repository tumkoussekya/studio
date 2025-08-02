
'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { suggestConversationStarter } from '@/ai/flows/suggest-conversation-starter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConversationStarter() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
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
        <Card className="bg-secondary/50 border-dashed h-[188px]">
            <CardHeader>
                <CardTitle className="text-lg">You're near another player!</CardTitle>
                <CardDescription>Break the ice with a little help from AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {isLoading ? (
                        <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Suggest an icebreaker
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

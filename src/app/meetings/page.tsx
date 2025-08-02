
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Video, VideoOff, PhoneOff, VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MeetingsPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(!track.enabled);
      });
    }
  };
  
  const handleHangUp = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    toast({
        title: "Call Ended",
        description: "You have left the meeting."
    })
    // In a real app, you'd redirect or change state here
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Sync Meeting</h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 relative">
        <div className="w-full h-full max-w-6xl max-h-[75vh] bg-secondary/30 rounded-lg flex items-center justify-center relative overflow-hidden">
          {hasCameraPermission === false && (
             <Alert variant="destructive" className="w-auto">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature.
                </AlertDescription>
            </Alert>
          )}

          <video 
            ref={videoRef} 
            className={cn("h-full w-full object-cover", !isVideoEnabled && "hidden")} 
            autoPlay 
            muted 
          />
          {!isVideoEnabled && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <VideoOff className="w-24 h-24"/>
              <p className="text-xl font-medium">Your camera is off</p>
            </div>
          )}
          
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Card className="p-2">
                    <CardContent className="flex items-center gap-4 p-0">
                         <Button onClick={toggleAudio} variant={isAudioMuted ? 'destructive' : 'secondary'} size="icon" className="w-12 h-12 rounded-full">
                            {isAudioMuted ? <MicOff /> : <Mic />}
                         </Button>
                         <Button onClick={toggleVideo} variant={!isVideoEnabled ? 'destructive' : 'secondary'} size="icon" className="w-12 h-12 rounded-full">
                            {isVideoEnabled ? <Video /> : <VideoOff />}
                         </Button>
                          <Button onClick={handleHangUp} variant="destructive" size="icon" className="w-12 h-12 rounded-full">
                            <PhoneOff />
                         </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="absolute top-4 right-4 w-48 h-36">
                <Card className="h-full w-full overflow-hidden shadow-lg">
                    <CardContent className="p-0 h-full w-full flex items-center justify-center bg-background">
                       <video 
                          className="h-full w-full object-cover"
                          autoPlay
                          muted // Mute self-view to prevent feedback
                          ref={(el) => {
                              if (el && stream) {
                                  el.srcObject = stream;
                              }
                          }}
                       />
                    </CardContent>
                </Card>
            </div>

        </div>
      </main>
    </div>
  );
}

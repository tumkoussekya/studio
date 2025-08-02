
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, ScreenShareOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type StreamType = 'camera' | 'screen';

export default function MeetingsPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const [activeStreamType, setActiveStreamType] = useState<StreamType>('camera');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Get camera permission on component mount
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCameraStream(mediaStream);
        setHasCameraPermission(true);
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
        cameraStream?.getTracks().forEach(track => track.stop());
        screenStream?.getTracks().forEach(track => track.stop());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // Effect to manage the video sources
  useEffect(() => {
    if (videoRef.current) {
        const activeStream = activeStreamType === 'camera' ? cameraStream : screenStream;
        videoRef.current.srcObject = activeStream;
    }
     if (selfVideoRef.current && cameraStream) {
        selfVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, screenStream, activeStreamType]);


  const toggleAudio = () => {
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(!track.enabled);
      });
    }
  };
  
  const handleHangUp = () => {
    cameraStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setScreenStream(null);
    toast({
        title: "Call Ended",
        description: "You have left the meeting."
    })
    // In a real app, you'd redirect or change state here
  }
  
  const toggleScreenShare = async () => {
    if (screenStream) {
        // Stop screen sharing
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setActiveStreamType('camera');
    } else {
        // Start screen sharing
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            
            // Listen for when the user stops sharing via the browser's native UI
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                setScreenStream(null);
                setActiveStreamType('camera');
            });
            
            setScreenStream(stream);
            setActiveStreamType('screen');
        } catch (error) {
            console.error("Screen sharing error:", error);
            toast({
                variant: 'destructive',
                title: 'Screen Share Failed',
                description: 'Could not start screen sharing. Please check permissions.'
            });
        }
    }
  };

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
            className={cn("h-full w-full object-contain", (activeStreamType === 'camera' && !isVideoEnabled) && "hidden")} 
            autoPlay 
            muted 
          />
          {activeStreamType === 'camera' && !isVideoEnabled && (
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
                         <Button onClick={toggleVideo} variant={!isVideoEnabled ? 'destructive' : 'secondary'} size="icon" className="w-12 h-12 rounded-full" disabled={activeStreamType === 'screen'}>
                            {isVideoEnabled ? <Video /> : <VideoOff />}
                         </Button>
                         <Button onClick={toggleScreenShare} variant={activeStreamType === 'screen' ? 'default' : 'secondary'} size="icon" className="w-12 h-12 rounded-full">
                            {activeStreamType === 'screen' ? <ScreenShareOff /> : <ScreenShare />}
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
                          ref={selfVideoRef}
                          className={cn("h-full w-full object-cover", !isVideoEnabled && "hidden")}
                          autoPlay
                          muted // Mute self-view to prevent feedback
                       />
                        {!isVideoEnabled && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-secondary">
                                <VideoOff className="w-8 h-8"/>
                                <p className="text-xs mt-2">Camera off</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
      </main>
    </div>
  );
}

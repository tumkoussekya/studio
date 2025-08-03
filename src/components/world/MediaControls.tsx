
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';

interface MediaControlsProps {
    stream: MediaStream | null;
    hasPermission: boolean;
}

export default function MediaControls({ stream, hasPermission }: MediaControlsProps) {
  const [audioState, setAudioState] = useState<'suspended' | 'running' | 'closed'>('suspended');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    const updateState = () => {
      if (Tone.context) setAudioState(Tone.context.state);
    };
    updateState();
    const interval = setInterval(updateState, 500);
    return () => clearInterval(interval);
  }, []);

  const toggleTrack = useCallback((kind: 'audio' | 'video') => {
    if (!stream) return;
    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    if (kind === 'audio') setIsMicOn(prev => !prev);
    if (kind === 'video') setIsCameraOn(prev => !prev);
  }, [stream]);

  useEffect(() => {
    if (stream) {
        setIsMicOn(stream.getAudioTracks().some(track => track.enabled));
        setIsCameraOn(stream.getVideoTracks().some(track => track.enabled));
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey) {
            if (event.key.toUpperCase() === 'A') {
                event.preventDefault();
                toggleTrack('audio');
            }
            if (event.key.toUpperCase() === 'V') {
                event.preventDefault();
                toggleTrack('video');
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };

  }, [stream, toggleTrack]);

  
  const startSpatialAudio = async () => {
    if (Tone.context.state !== 'running') {
        try {
            window.dispatchEvent(new Event('start-audio'));
        } catch (e) {
            console.error("Could not dispatch start-audio event", e);
        }
    }
  };


  return (
    <div>
        <div className="grid grid-cols-2 gap-2">
            <Button
                onClick={() => toggleTrack('audio')}
                variant={isMicOn ? "outline" : "destructive"}
                disabled={!hasPermission}
            >
                {isMicOn ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                Mic
            </Button>
            <Button
                onClick={() => toggleTrack('video')}
                variant={isCameraOn ? "outline" : "destructive"}
                disabled={!hasPermission}
            >
                {isCameraOn ? <Video className="mr-2 h-4 w-4" /> : <VideoOff className="mr-2 h-4 w-4" />}
                Camera
            </Button>
        </div>
        <div className="mt-2">
             <Button
                onClick={startSpatialAudio}
                variant="outline"
                className="w-full"
                disabled={audioState === 'running'}
            >
                {audioState === 'running' ? (
                    <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Spatial Audio On
                    </>
                ) : (
                    <>
                        <VolumeX className="mr-2 h-4 w-4" />
                        Enable Spatial Audio
                    </>
                )}
            </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
            Use headphones for the best experience. Hotkeys: Ctrl+Shift+A (mic), Ctrl+Shift+V (camera).
        </p>
    </div>
  );
}

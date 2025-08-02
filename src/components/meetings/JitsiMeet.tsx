
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';

interface JitsiMeetProps {
  roomName: string;
  onMeetingEnd?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JitsiMeet: React.FC<JitsiMeetProps> = ({ roomName, onMeetingEnd }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the Jitsi API script is loaded
    if (!window.JitsiMeetExternalAPI) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Jitsi Meet API not loaded. Please refresh the page.',
      });
      return;
    }

    let userDisplayName = 'Guest';
    const token = getCookie('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userDisplayName = payload.email || 'User';
        } catch (error) {
            console.warn("Could not parse user token for Jitsi display name.");
        }
    }


    const domain = 'meet.jit.si';
    const options = {
      roomName: `SyncroSpace-${roomName}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur',
        ],
      },
       configOverwrite: {
        prejoinPageEnabled: false, // Disables the page where you set your name and devices
      },
      userInfo: {
        displayName: userDisplayName
      }
    };

    // Initialize the JitsiMeeting
    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;
    setLoading(false);

    // Add event listeners
    api.addEventListener('videoConferenceLeft', () => {
      console.log('User left the meeting');
      if (onMeetingEnd) {
        onMeetingEnd();
      }
    });

    // Cleanup function
    return () => {
      console.log('Disposing Jitsi Meet API');
      jitsiApiRef.current?.dispose();
    };
  }, [roomName, onMeetingEnd, toast]);

  return (
    <>
      {loading && <div className="text-white text-center p-8">Loading Meeting...</div>}
      <div
        ref={jitsiContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />
    </>
  );
};

export default JitsiMeet;

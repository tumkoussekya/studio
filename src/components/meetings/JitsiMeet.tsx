
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

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
  const [displayName, setDisplayName] = useState('Guest');

  useEffect(() => {
    const fetchUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: userData } = await supabase.from('users').select('first_name, email').eq('id', user.id).single();
            setDisplayName(userData?.first_name || userData?.email || 'Guest');
        }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!displayName || !jitsiContainerRef.current) return;

    // Check if the Jitsi API script is loaded
    if (typeof window.JitsiMeetExternalAPI === 'undefined') {
        toast({
            variant: 'destructive',
            title: 'Error Loading Meeting',
            description: 'The Jitsi Meet API script could not be found. Please ensure you are connected to the internet and refresh the page.',
        });
        setLoading(false);
        return;
    }
    
    // Avoid re-initializing the API if it already exists
    if (jitsiApiRef.current) {
        return;
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
        prejoinPageEnabled: false,
      },
      userInfo: {
        displayName: displayName
      }
    };

    try {
        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
        setLoading(false);
    
        api.addEventListener('videoConferenceLeft', () => {
          if (onMeetingEnd) {
            onMeetingEnd();
          }
        });
    
        return () => {
          jitsiApiRef.current?.dispose();
          jitsiApiRef.current = null;
        };
    } catch (error) {
        console.error("Failed to initialize Jitsi Meet API:", error);
        toast({
            variant: 'destructive',
            title: 'Meeting Error',
            description: 'Could not initialize the video meeting.',
        });
    }

  }, [roomName, onMeetingEnd, toast, displayName]);

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

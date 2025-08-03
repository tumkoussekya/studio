
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
        if (user && user.email) {
            setDisplayName(user.email);
        }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!displayName || !jitsiContainerRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Jitsi Meet API not loaded. Please refresh the page.',
      });
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
    };
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


'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UserVideoProps {
  stream: MediaStream;
  muted?: boolean;
  isLocal?: boolean;
  email?: string;
}

const UserVideo: React.FC<UserVideoProps> = ({ stream, muted = false, isLocal = false, email }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isVideoEnabled = stream.getVideoTracks().some(track => track.enabled);

  if (!isVideoEnabled) {
    return null;
  }

  if (isLocal) {
     return (
        <Card className="absolute bottom-4 left-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl z-20 border-primary border-2">
            <video
                ref={videoRef}
                autoPlay
                muted={muted}
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
            />
        </Card>
      );
  }

  return (
    <Card className="w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-secondary border-2 relative">
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs truncate">
        {email || 'Remote User'}
      </div>
    </Card>
  );
};

export default UserVideo;

    
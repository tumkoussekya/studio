
'use client';

import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface UserVideoProps {
  stream: MediaStream;
}

const UserVideo: React.FC<UserVideoProps> = ({ stream }) => {
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

  return (
    <Card className="absolute bottom-4 left-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl z-20 border-primary border-2">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
    </Card>
  );
};

export default UserVideo;

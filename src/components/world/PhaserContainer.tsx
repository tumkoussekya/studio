
'use client';

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { MainScene } from '@/lib/phaser/scenes/MainScene';
import { verify } from 'jsonwebtoken';
import { getCookie } from 'cookies-next';

interface PhaserContainerProps {
  onPlayerNear: () => void;
  onPlayerFar: () => void;
}

export default function PhaserContainer({ onPlayerNear, onPlayerFar }: PhaserContainerProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !gameContainerRef.current) {
      return;
    }
    
    const token = getCookie('token') as string | undefined;
    let startX = 200;
    let startY = 200;

    if (token) {
        try {
            // NOTE: This is NOT secure for production.
            // The secret should never be exposed on the client.
            // This is for demonstration purposes only.
            const decoded = verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret') as { lastX?: number, lastY?: number };
            if (decoded.lastX && decoded.lastY) {
                startX = decoded.lastX;
                startY = decoded.lastY;
            }
        } catch (e) {
            console.error("Invalid token:", e);
        }
    }


    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameContainerRef.current,
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
        },
      },
      backgroundColor: 'hsl(var(--background))',
      callbacks: {
        postBoot: (game) => {
          game.registry.set('onPlayerNear', onPlayerNear);
          game.registry.set('onPlayerFar', onPlayerFar);
          
          const mainScene = game.scene.getScene('MainScene') as MainScene;
          if (mainScene) {
            mainScene.scene.start(undefined, { startX, startY });
          }
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onPlayerNear, onPlayerFar]);

  return <div ref={gameContainerRef} className="w-full h-full" />;
}


'use client';

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { MainScene } from '@/lib/phaser/scenes/MainScene';
import { verify } from 'jsonwebtoken';
import { getCookie } from 'cookies-next';
import { chatService } from '@/services/ChatService';

interface PhaserContainerProps {
  onPlayerNear: () => void;
  onPlayerFar: () => void;
  onSceneReady: (scene: MainScene) => void;
}

export default function PhaserContainer({ onPlayerNear, onPlayerFar, onSceneReady }: PhaserContainerProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !gameContainerRef.current) {
      return;
    }
    
    let startX = 200;
    let startY = 200;
    let email = 'Guest';
    let clientId = chatService.getClientId(); // Get initial client ID from service

    const token = getCookie('token') as string | undefined;
    if (token) {
        try {
            // Using a dummy secret on the client as it's just for reading public claims
            const decoded = JSON.parse(atob(token.split('.')[1])) as { email: string, userId: string, lastX?: number, lastY?: number };
            if (decoded.lastX && decoded.lastY) {
                startX = decoded.lastX;
                startY = decoded.lastY;
            }
            email = decoded.email;
            clientId = decoded.userId;
        } catch (e) {
            console.error("Could not decode token:", e);
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
            onSceneReady(mainScene);
            mainScene.scene.start(undefined, { startX, startY, email, clientId, chatService });
          }
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onPlayerNear, onPlayerFar, onSceneReady]);

  return <div ref={gameContainerRef} className="w-full h-full" />;
}

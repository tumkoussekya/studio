
'use client';

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { MainScene } from '@/lib/phaser/scenes/MainScene';
import { realtimeService } from '@/services/RealtimeService';
import type { UserRole } from '@/models/User';

interface UserData {
    id: string;
    email: string;
    role: UserRole;
    last_x: number;
    last_y: number;
}

interface PhaserContainerProps {
  onPlayerNearNpc: () => void;
  onPlayerFarNpc: () => void;
  onPlayerNear: (clientId: string, email: string) => void;
  onPlayerFar: () => void;
  onZoneChange: (zoneId: string) => void;
  onSceneReady: (scene: MainScene) => void;
  user: UserData;
}

export default function PhaserContainer({ user, onPlayerNearNpc, onPlayerFarNpc, onPlayerNear, onPlayerFar, onZoneChange, onSceneReady }: PhaserContainerProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !gameContainerRef.current) {
      return;
    }

    const scene = new MainScene();
    onSceneReady(scene);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameContainerRef.current,
      scene: scene,
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
          game.registry.set('onPlayerNearNpc', onPlayerNearNpc);
          game.registry.set('onPlayerFarNpc', onPlayerFarNpc);
          game.registry.set('onPlayerNear', onPlayerNear);
          game.registry.set('onPlayerFar', onPlayerFar);
          game.registry.set('onZoneChange', onZoneChange);
          
          const mainScene = game.scene.getScene('MainScene') as MainScene;
          if (mainScene) {
            // Pass necessary data to the scene's init method
            mainScene.scene.start(undefined, { 
                startX: user.last_x, 
                startY: user.last_y, 
                email: user.email, 
                clientId: user.id, 
                role: user.role, 
                realtimeService 
            });
          }
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [user, onPlayerNearNpc, onPlayerFarNpc, onPlayerNear, onPlayerFar, onZoneChange, onSceneReady]);

  return <div ref={gameContainerRef} className="w-full h-full" />;
}

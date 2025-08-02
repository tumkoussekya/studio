
'use client';

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { MainScene } from '@/lib/phaser/scenes/MainScene';

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

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameContainerRef.current,
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
      scene: [MainScene],
      backgroundColor: 'hsl(var(--background))',
      callbacks: {
        postBoot: (game) => {
          game.registry.set('onPlayerNear', onPlayerNear);
          game.registry.set('onPlayerFar', onPlayerFar);
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

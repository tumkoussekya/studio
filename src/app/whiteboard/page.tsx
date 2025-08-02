
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Palette, Pen, Users } from 'lucide-react';
import * as Ably from 'ably';
import { useDebouncedCallback } from 'use-debounce';
import { Badge } from '@/components/ui/badge';

interface DrawingData {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  brushSize: number;
}

// Connect to Ably
const ably = new Ably.Realtime({ authUrl: '/api/ably-token', authMethod: 'POST' });
const channel = ably.channels.get('whiteboard');

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const lastPosition = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    // --- Canvas Setup ---
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const scale = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(scale, scale);
    contextRef.current = context;

    // --- Ably Setup ---
    const handlePresence = () => {
        channel.presence.get((err, members) => {
            if (!err && members) {
                setOnlineUsers(members.length);
            }
        });
    };
    
    channel.presence.subscribe(['enter', 'leave'], handlePresence);
    channel.presence.enter();
    
    channel.subscribe('draw', (message: Ably.Types.Message) => {
        const data: DrawingData = message.data;
        const remoteContext = canvas.getContext('2d');
        if(remoteContext) {
            remoteContext.beginPath();
            remoteContext.strokeStyle = data.color;
            remoteContext.lineWidth = data.brushSize;
            remoteContext.moveTo(data.from.x, data.from.y);
            remoteContext.lineTo(data.to.x, data.to.y);
            remoteContext.stroke();
            remoteContext.closePath();
        }
    });

    channel.subscribe('clear', () => {
        clearCanvas(false); // Don't publish again
    });


    return () => {
        channel.presence.leave();
        channel.unsubscribe();
    }

  }, []);

  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  const publishDrawData = useDebouncedCallback((data: DrawingData) => {
    channel.publish('draw', data);
  }, 10); // Debounce to avoid flooding the channel

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    lastPosition.current = { x: offsetX, y: offsetY };
  };

  const finishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    lastPosition.current = null;
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current) return;
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;

    // Draw locally first
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    
    // Then publish to others
    publishDrawData({
        from: lastPosition.current,
        to: { x: offsetX, y: offsetY },
        color,
        brushSize
    });

    lastPosition.current = { x: offsetX, y: offsetY };
  };

  const clearCanvas = (publish = true) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (publish) {
        channel.publish('clear', {});
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Collaborative Whiteboard</h1>
        <div className="flex items-center gap-4">
             <Badge variant="outline" className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                <span>{onlineUsers} user{onlineUsers !== 1 ? 's' : ''} online</span>
             </Badge>
            <Card className="p-2">
                <CardContent className="flex items-center gap-6 p-0">
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                    </div>
                     <div className="flex items-center gap-2 w-40">
                        <Pen className="h-5 w-5" />
                        <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={[brushSize]}
                            onValueChange={(value) => setBrushSize(value[0])}
                        />
                    </div>
                    <Button variant="outline" onClick={() => clearCanvas(true)}>
                        <Eraser className="h-5 w-5 mr-2" />
                        Clear
                    </Button>
                </CardContent>
            </Card>
        </div>
      </header>
      <main className="flex-grow relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
          className="absolute top-0 left-0 w-full h-full"
        />
      </main>
    </div>
  );
}

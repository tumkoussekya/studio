
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Palette, Pen, Users, Square } from 'lucide-react';
import * as Ably from 'ably';
import { useDebouncedCallback } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tool = 'pen' | 'rectangle';

interface BaseDrawingData {
  tool: Tool;
  color: string;
  brushSize: number;
}
interface PenData extends BaseDrawingData {
  tool: 'pen';
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface RectangleData extends BaseDrawingData {
  tool: 'rectangle';
  from: { x: number; y: number };
  to: { x: number; y: number };
}

type DrawingData = PenData | RectangleData;

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
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const snapshot = useRef<ImageData | null>(null);


  useEffect(() => {
    // --- Canvas Setup ---
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const scale = window.devicePixelRatio;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.offsetWidth * scale;
      canvas.height = parent.offsetHeight * scale;
    }


    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(scale, scale);
    contextRef.current = context;
    context.lineCap = 'round';
    context.lineJoin = 'round';

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
           drawOnCanvas(remoteContext, data);
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

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, data: DrawingData) => {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.brushSize;

      if (data.tool === 'pen') {
          ctx.beginPath();
          ctx.moveTo(data.from.x, data.from.y);
          ctx.lineTo(data.to.x, data.to.y);
          ctx.stroke();
          ctx.closePath();
      } else if (data.tool === 'rectangle') {
           ctx.beginPath();
           ctx.rect(data.from.x, data.from.y, data.to.x - data.from.x, data.to.y - data.from.y);
           ctx.stroke();
           ctx.closePath();
      }
  };


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
  }, 10); 

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = contextRef.current;
    if (!context) return;

    setIsDrawing(true);
    lastPosition.current = { x: offsetX, y: offsetY };

    if (currentTool === 'pen') {
        context.beginPath();
        context.moveTo(offsetX, offsetY);
    } else if (currentTool === 'rectangle') {
        snapshot.current = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    }
  };

  const finishDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = contextRef.current;
    if (!context) return;

    setIsDrawing(false);

    if (currentTool === 'pen') {
        context.closePath();
    } else if (currentTool === 'rectangle') {
        const rectData: RectangleData = {
            tool: 'rectangle',
            from: lastPosition.current,
            to: { x: offsetX, y: offsetY },
            color,
            brushSize
        };
        drawOnCanvas(context, rectData);
        publishDrawData(rectData);
    }
    lastPosition.current = null;
    snapshot.current = null;
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    
    if (currentTool === 'pen') {
        // Draw locally first
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        
        // Then publish to others
        const penData: PenData = {
            tool: 'pen',
            from: lastPosition.current,
            to: { x: offsetX, y: offsetY },
            color,
            brushSize
        };
        publishDrawData(penData);

        lastPosition.current = { x: offsetX, y: offsetY };
    } else if (currentTool === 'rectangle' && snapshot.current) {
        contextRef.current.putImageData(snapshot.current, 0, 0);
        contextRef.current.beginPath();
        contextRef.current.rect(lastPosition.current.x, lastPosition.current.y, offsetX - lastPosition.current.x, offsetY - lastPosition.current.y);
        contextRef.current.stroke();
    }
  };

  const clearCanvas = (publish = true) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
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
                <CardContent className="flex items-center gap-4 p-0">
                     <Button variant="ghost" size="icon" onClick={() => setCurrentTool('pen')} className={cn(currentTool === 'pen' && 'bg-accent text-accent-foreground')}>
                        <Pen className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => setCurrentTool('rectangle')} className={cn(currentTool === 'rectangle' && 'bg-accent text-accent-foreground')}>
                        <Square className="h-5 w-5" />
                    </Button>
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

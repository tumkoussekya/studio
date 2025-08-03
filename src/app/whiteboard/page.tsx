
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Palette, Pen, Users, Square, Save, Loader2 } from 'lucide-react';
import { realtimeService } from '@/services/RealtimeService';
import type { DrawingData, PenData, RectangleData, Tool, ClearData } from '@/models/Whiteboard';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PresenceData } from '@/services/RealtimeService';
import type * as Ably from 'ably';
import { createClient } from '@/lib/supabase/client';

const WHITEBOARD_ID = 'b7e2f7a8-8f6a-4b1e-8e4a-3e4d8f6a3b1e'; // Hardcoded for single whiteboard demo

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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [drawingHistory, setDrawingHistory] = useState<DrawingData[]>([]);

  // --- Ably & Data Sync ---
  const drawOnCanvas = useCallback((ctx: CanvasRenderingContext2D, data: DrawingData) => {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.brushSize;
      ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';


      if (data.tool === 'pen' || data.tool === 'eraser') {
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
  }, []);

  const loadCanvasState = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/whiteboard/${WHITEBOARD_ID}`);
        if (!response.ok) throw new Error("Could not load whiteboard state.");
        const data = await response.json();
        
        const context = contextRef.current;
        if (context && data && data.content) {
            setDrawingHistory(data.content);
            data.content.forEach((drawing: DrawingData) => {
                drawOnCanvas(context, drawing);
            });
        }
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsLoading(false);
    }
  }, [drawOnCanvas, toast]);

  // Debounced publish function
  const publishDrawData = useDebouncedCallback((data: DrawingData) => {
    realtimeService.publishToChannel('whiteboard', 'draw', data);
  }, 10);

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
    
    loadCanvasState();
    
    // --- Ably Setup ---
    const handlePresence = (presenceMessage?: Ably.Types.PresenceMessage) => {
        realtimeService.getPresence('whiteboard', (err, members) => {
            if (!err && members) {
                setOnlineUsers(members.length);
            }
        });
    };
    
    const handleDraw = (message: Ably.Types.Message) => {
        const data: DrawingData = message.data;
        if(contextRef.current) {
            drawOnCanvas(contextRef.current, data);
            setDrawingHistory(prev => [...prev, data]);
        }
    };

    const handleClear = () => {
        clearCanvas(false);
    }
    
    realtimeService.subscribeToChannels(['whiteboard'], 'whiteboard-user');
    realtimeService.onPresenceUpdate('whiteboard', handlePresence);
    realtimeService.subscribeToChannelEvent('whiteboard', 'draw', handleDraw);
    realtimeService.subscribeToChannelEvent('whiteboard', 'clear', handleClear);

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session }}) => {
       if (session?.user.email) {
          realtimeService.enterPresence({ email: session.user.email, id: session.user.id }, 'whiteboard');
       }
    });

    return () => {
        realtimeService.disconnect();
    }
  }, [loadCanvasState, drawOnCanvas]);


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


  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = contextRef.current;
    if (!context || isLoading) return;

    setIsDrawing(true);
    lastPosition.current = { x: offsetX, y: offsetY };

    if (currentTool === 'pen' || currentTool === 'eraser') {
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

    if (currentTool === 'pen' || currentTool === 'eraser') {
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
        setDrawingHistory(prev => [...prev, rectData]);
    }
    lastPosition.current = null;
    snapshot.current = null;
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        
        const penData: PenData = {
            tool: currentTool,
            from: lastPosition.current,
            to: { x: offsetX, y: offsetY },
            color,
            brushSize
        };
        publishDrawData(penData);
        setDrawingHistory(prev => [...prev, penData]);


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
      setDrawingHistory([]);
      if (publish) {
        realtimeService.publishToChannel('whiteboard', 'clear', {} as ClearData);
      }
    }
  };

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setIsSaving(true);
    try {
        const response = await fetch(`/api/whiteboard/${WHITEBOARD_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: drawingHistory })
        });

        if (!response.ok) throw new Error("Failed to save whiteboard.");
        toast({ title: "Whiteboard Saved!", description: "Your drawing has been saved to the cloud." });

    } catch(error: any) {
         toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Collaborative Whiteboard</h1>
        <div className="flex items-center gap-4">
             <Badge variant="outline" className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                <span>{onlineUsers} user{onlineUsers !== 1 ? 's' : ''} online</span>
             </Badge>
            <Card className="p-2">
                <CardContent className="flex items-center flex-wrap gap-4 p-0">
                     <Button variant="ghost" size="icon" onClick={() => setCurrentTool('pen')} className={cn(currentTool === 'pen' && 'bg-accent text-accent-foreground')}>
                        <Pen className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => setCurrentTool('rectangle')} className={cn(currentTool === 'rectangle' && 'bg-accent text-accent-foreground')}>
                        <Square className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentTool('eraser')} className={cn(currentTool === 'eraser' && 'bg-accent text-accent-foreground')}>
                        <Eraser className="h-5 w-5" />
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
                        Clear All
                    </Button>
                    <Button variant="outline" onClick={saveCanvas} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                        Save
                    </Button>
                </CardContent>
            </Card>
        </div>
      </header>
      <main className="flex-grow relative bg-muted/20">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )}
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

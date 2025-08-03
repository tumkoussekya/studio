
'use client';

import * as Ably from 'ably';
import type { DrawingData } from '@/models/Whiteboard';

export interface MessageData {
    author: string;
    text: string;
}

export interface PresenceData {
    email: string;
    id: string;
}

export interface PlayerUpdateData {
    type: 'move';
    payload: {
        x: number;
        y: number;
        email: string;
        clientId: string;
    }
}

export interface KnockData {
    fromClientId: string;
    fromEmail: string;
    targetClientId: string;
}

export interface EmoteData {
    clientId: string;
    emote: string;
}

export interface ClearData {}

export interface WebRTCSignalData {
    from: string;
    to: string;
    type: 'offer' | 'answer' | 'candidate';
    payload: any;
}


type MessageHandler = (message: Ably.Types.Message, channelId: string) => void;
type HistoryHandler = (messages: Ably.Types.Message[], channelId: string) => void;
type PresenceHandler = (presenceMessage?: Ably.Types.PresenceMessage) => void;
type PlayerUpdateHandler = (message: Ably.Types.Message) => void;
type KnockHandler = (data: KnockData) => void;
type DrawingHandler = (message: Ably.Types.Message) => void;
type ClearHandler = () => void;


const E2E_KEY = process.env.NEXT_PUBLIC_ABLY_E2E_KEY || "HO4oK9VllF/g3Y+e1dG1A/dDESfSDjI0aEZ1LzH1y0E=";

class RealtimeService {
    private ably: Ably.Realtime;
    private channels: Map<string, Ably.Types.RealtimeChannel> = new Map();
    private connectionPromise: Promise<void>;
    private currentUserId: string | null = null;
    private eventHandlers: Map<string, Map<string, ((...args: any[]) => void)[]>> = new Map();


    constructor() {
        this.ably = new Ably.Realtime({
            authUrl: '/api/ably-token',
            authMethod: 'POST',
        });
        
        this.connectionPromise = new Promise((resolve) => {
            this.ably.connection.on('connected', () => {
                console.log('Ably connected!');
                this.currentUserId = this.ably.auth.clientId;
                resolve();
            });
        });

        this.ably.connection.on('closed', () => {
            console.log('Ably connection was closed.');
        });
    }

    private getChannel(channelId: string, conversationType: 'channel' | 'dm' = 'channel'): Ably.Types.RealtimeChannel {
        let finalChannelId = channelId;
        if (conversationType === 'dm' && this.currentUserId) {
            finalChannelId = this.getDmChannelId(this.currentUserId, channelId);
        }
        
        if (!this.channels.has(finalChannelId)) {
            const isEncrypted = !['pixel-space', 'whiteboard'].includes(finalChannelId);
            const channelOptions: Ably.Types.ChannelOptions = {
                params: { rewind: '50' },
            };
            if(isEncrypted) {
                channelOptions.cipher = {
                    algorithm: 'aes',
                    keyLength: 256,
                    mode: 'cbc',
                    key: E2E_KEY
                }
            }
            const channel = this.ably.channels.get(finalChannelId, channelOptions);
            this.channels.set(finalChannelId, channel);
            this.subscribeToAllEvents(channel, finalChannelId);
            this.fetchHistory(finalChannelId, conversationType);
        }
        return this.channels.get(finalChannelId)!;
    }
    
    public getDmChannelId(userId1: string, userId2: string): string {
        const sortedIds = [userId1, userId2].sort();
        return `dm-${sortedIds[0]}-${sortedIds[1]}`;
    }

    public async subscribeToChannels(channelIds: string[], currentUserId: string) {
        await this.connectionPromise;
        this.currentUserId = currentUserId;

        for (const id of channelIds) {
            this.getChannel(id);
        }
    }
    
    private async subscribeToAllEvents(channel: Ably.Types.RealtimeChannel, channelId: string) {
        await this.connectionPromise;
        
        channel.subscribe((message) => {
            const handlers = this.eventHandlers.get(channelId)?.get(message.name);
            if(handlers) {
                handlers.forEach(handler => handler(message));
            }

            // Also trigger generic message handler if it exists
            const genericHandlers = this.eventHandlers.get('__any__')?.get('__generic_message');
             if(genericHandlers) {
                genericHandlers.forEach(handler => handler(message, channelId));
            }
        });
    }

    public subscribeToChannelEvent(channelId: string, eventName: string, handler: (...args: any[]) => void) {
        if (!this.eventHandlers.has(channelId)) {
            this.eventHandlers.set(channelId, new Map());
        }
        if (!this.eventHandlers.get(channelId)!.has(eventName)) {
            this.eventHandlers.get(channelId)!.set(eventName, []);
        }
        this.eventHandlers.get(channelId)!.get(eventName)!.push(handler);
        this.getChannel(channelId); // Ensure channel is initialized
    }
    
     public publishToChannel(channelId: string, eventName: string, data: any) {
        const channel = this.getChannel(channelId);
        channel.publish(eventName, data);
    }


    public getClientId(): string {
        return this.ably.auth.clientId;
    }

    public onMessage(handler: MessageHandler): void { 
      const genericMessageHandler = (message: Ably.Types.Message, channelId: string) => {
        if (message.name === 'message') {
            handler(message, channelId);
        }
      };
      this.subscribeToChannelEvent('__any__', '__generic_message', genericMessageHandler); 
    }
    public onHistory(handler: HistoryHandler): void { this.subscribeToChannelEvent('__any__', '__history', handler); }
    public onPlayerUpdate(handler: PlayerUpdateHandler): void { this.subscribeToChannelEvent('pixel-space', 'player-update', handler); }
    public onKnock(handler: KnockHandler): void { 
         const knockWrapper = (message: Ably.Types.Message) => {
            const data = message.data as KnockData;
            if (data.targetClientId === this.getClientId()) {
                handler(data);
            }
        };
        this.subscribeToChannelEvent('pixel-space', 'knock', knockWrapper);
    }
    public onWebRTCSignal(handler: (data: WebRTCSignalData) => void) {
        const signalWrapper = (message: Ably.Types.Message) => {
            const data = message.data as WebRTCSignalData;
            if(data.to === this.getClientId()) {
                handler(data);
            }
        };
        this.subscribeToChannelEvent('pixel-space', 'webrtc-signal', signalWrapper);
    }


    public onPresenceUpdate(channelId: string, handler: PresenceHandler): void {
        const channel = this.getChannel(channelId);
        channel.presence.subscribe(['enter', 'leave', 'update'], handler);
        channel.presence.get((err, members) => {
            if (!err && members) handler();
        });
    }
    
    public getPresence(channelId: string, callback: Ably.Types.PaginatedResultCallback<Ably.Types.PresenceMessage>): void {
        const channel = this.getChannel(channelId);
        channel.presence.get(callback);
    }

    public async enterPresence(userData: PresenceData, channelId: string = 'pixel-space') {
        await this.connectionPromise;
        const channel = this.getChannel(channelId);
        channel.presence.enter(userData);
    }

    public fetchHistory(channelId: string, type: 'channel' | 'dm' = 'channel') {
        const channel = this.getChannel(channelId, type);
         channel.history((err, result) => {
            if (!err && result.items) {
                const historyHandlers = this.eventHandlers.get('__any__')?.get('__history');
                if (historyHandlers) {
                    historyHandlers.forEach(handler => handler(result.items, channel.name));
                }
            } else if (err) {
                console.error(`Error fetching history for ${channel.name}:`, err);
            }
        });
    }
    
    public sendMessage(channelId: string, text: string, data?: { author: string }, type: 'channel' | 'dm' = 'channel'): void {
        const channel = this.getChannel(channelId, type);
        channel.publish('message', { text, ...data });
    }

    public sendKnock(targetClientId: string, fromEmail: string): void {
        const knockData: KnockData = {
            targetClientId,
            fromClientId: this.getClientId(),
            fromEmail: fromEmail
        };
        this.publishToChannel('pixel-space', 'knock', knockData);
    }
    
    public broadcastPlayerPosition(x: number, y: number, email: string, clientId: string): void {
        const event: PlayerUpdateData = {
            type: 'move',
            payload: { x, y, email, clientId }
        };
        this.publishToChannel('pixel-space', 'player-update', event);
    }

    public sendWebRTCSignal(data: WebRTCSignalData): void {
        this.publishToChannel('pixel-space', 'webrtc-signal', data);
    }
    
    public disconnect(): void {
        if (this.ably && this.ably.connection.state === 'connected') {
            this.ably.close();
        }
        this.channels.clear();
        this.eventHandlers.clear();
    }
}

export const realtimeService = new RealtimeService();
export { RealtimeService };

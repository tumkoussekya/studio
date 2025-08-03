
'use client';

import * as Ably from 'ably';

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


type MessageHandler = (message: Ably.Types.Message, channelId: string) => void;
type HistoryHandler = (messages: Ably.Types.Message[], channelId: string) => void;
type PresenceHandler = (presenceMessage: Ably.Types.PresenceMessage) => void;
type PlayerUpdateHandler = (message: Ably.Types.Message) => void;
type KnockHandler = (data: KnockData) => void;

const E2E_KEY = process.env.NEXT_PUBLIC_ABLY_E2E_KEY || "HO4oK9VllF/g3Y+e1dG1A/dDESfSDjI0aEZ1LzH1y0E=";

class RealtimeService {
    private ably: Ably.Realtime;
    private channels: Map<string, Ably.Types.RealtimeChannel> = new Map();
    private connectionPromise: Promise<void>;

    private messageHandler: MessageHandler | null = null;
    private historyHandler: HistoryHandler | null = null;
    private playerUpdateHandler: PlayerUpdateHandler | null = null;
    private knockHandler: KnockHandler | null = null;
    private presenceHandlers: Map<string, { enter: PresenceHandler[], leave: PresenceHandler[], update: PresenceHandler[] }> = new Map();


    constructor() {
        this.ably = new Ably.Realtime({
            authUrl: '/api/ably-token',
            authMethod: 'POST',
        });
        
        this.connectionPromise = new Promise((resolve) => {
            this.ably.connection.on('connected', () => {
                console.log('Ably connected!');
                resolve();
            });
        });

        this.ably.connection.on('closed', () => {
            console.log('Ably connection was closed.');
        });
    }

    private getChannel(channelId: string): Ably.Types.RealtimeChannel {
        if (!this.channels.has(channelId)) {
            const channelOptions: Ably.Types.ChannelOptions = {
                params: { rewind: '50' },
                cipher: {
                    algorithm: 'aes',
                    keyLength: 256,
                    mode: 'cbc',
                    key: E2E_KEY
                }
            };
            const channel = this.ably.channels.get(channelId, channelOptions);
            this.channels.set(channelId, channel);
        }
        return this.channels.get(channelId)!;
    }
    
    public getDmChannelId(userId1: string, userId2: string): string {
        const sortedIds = [userId1, userId2].sort();
        return `dm-${sortedIds[0]}-${sortedIds[1]}`;
    }

    public async subscribeToChannels(channelIds: string[], currentUserId: string) {
        await this.connectionPromise;
        const allChannelIds = new Set<string>(channelIds.map(id => {
            if (this.isUserChannel(id)) {
                return this.getDmChannelId(currentUserId, id);
            }
            return id;
        }));

        allChannelIds.add('pixel-space'); // Always subscribe to the main world channel

        for (const id of allChannelIds) {
            this.subscribeToChannel(id);
        }
    }
    
    private isUserChannel(id: string): boolean {
        // A simple check; in a real app, you might have a prefix or a different format.
        return !['general', 'design-team', 'project-phoenix', 'pixel-space'].includes(id);
    }
    
    private async subscribeToChannel(channelId: string) {
        await this.connectionPromise;
        const channel = this.getChannel(channelId);
        
        channel.subscribe('message', (message) => this.messageHandler?.(message, channelId));
        channel.subscribe('player-update', (message) => this.playerUpdateHandler?.(message));
        channel.subscribe('knock', (message) => {
            const data = message.data as KnockData;
            if (this.knockHandler && data.targetClientId === this.getClientId()) {
                this.knockHandler(data);
            }
        });

        channel.history((err, result) => {
            if (!err && result.items) {
                this.historyHandler?.(result.items, channelId);
            }
        });
    }

    public getClientId(): string {
        return this.ably.auth.clientId;
    }

    public onMessage(handler: MessageHandler): void { this.messageHandler = handler; }
    public onHistory(handler: HistoryHandler): void { this.historyHandler = handler; }
    public onPlayerUpdate(handler: PlayerUpdateHandler): void { this.playerUpdateHandler = handler; }
    public onKnock(handler: KnockHandler): void { this.knockHandler = handler; }

    public onPresenceUpdate(channelId: string, handler: PresenceHandler): void {
        const channel = this.getChannel(channelId);
        channel.presence.subscribe(['enter', 'leave', 'update'], handler);
        // Also call it immediately with current members
        channel.presence.get((err, members) => {
            if (!err && members) handler();
        });
    }
    
    public getPresence(channelId: string, callback: Ably.Types.PaginatedResultCallback<Ably.Types.PresenceMessage>): void {
        const channel = this.getChannel(channelId);
        channel.presence.get(callback);
    }

    public async enterPresence(userData: PresenceData) {
        await this.connectionPromise;
        const pixelSpaceChannel = this.getChannel('pixel-space');
        pixelSpaceChannel.presence.enter(userData);
    }

    public fetchHistory(channelId: string) {
        const channel = this.getChannel(channelId);
         channel.history((err, result) => {
            if (!err && result.items) {
                this.historyHandler?.(result.items, channelId);
            }
        });
    }
    
    public sendMessage(channelId: string, text: string, data?: { author: string }): void {
        const channel = this.getChannel(channelId);
        channel.publish('message', { text, ...data });
    }

    public sendKnock(targetClientId: string, fromEmail: string): void {
        const channel = this.getChannel('pixel-space');
        const knockData: KnockData = {
            targetClientId,
            fromClientId: this.getClientId(),
            fromEmail: fromEmail
        };
        channel.publish('knock', knockData);
    }
    
    public broadcastPlayerPosition(x: number, y: number, email: string, clientId: string): void {
        const channel = this.getChannel('pixel-space');
        const event: PlayerUpdateData = {
            type: 'move',
            payload: { x, y, email, clientId }
        };
        channel.publish('player-update', event);
    }

    public disconnect(): void {
        this.ably.close();
    }
}

export const realtimeService = new RealtimeService();
export { RealtimeService };

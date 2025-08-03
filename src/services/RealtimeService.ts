
'use client';

import * as Ably from 'ably';

export interface MessageData {
    author: string;
    text: string;
}

export interface PresenceData {
    email: string;
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


type MessageHandler = (message: Ably.Types.Message) => void;
type HistoryHandler = (messages: Ably.Types.Message[]) => void;
type PresenceHandler = (presenceMessage: Ably.Types.PresenceMessage) => void;
type PlayerUpdateHandler = (message: Ably.Types.Message) => void;
type KnockHandler = (data: KnockData) => void;

// This is a default, properly Base64-encoded 256-bit AES key.
// In a real-world application, this key should be managed via environment variables
// and shared securely between the participants of a conversation.
const E2E_KEY = process.env.NEXT_PUBLIC_ABLY_E2E_KEY || "HO4oK9VllF/g3Y+e1dG1A/dDESfSDjI0aEZ1LzH1y0E=";

class RealtimeService {
    private ably: Ably.Realtime;
    private pixelSpaceChannel: Ably.Types.RealtimeChannel;
    private whiteboardChannel: Ably.Types.RealtimeChannel;
    private connectionPromise: Promise<void>;

    private messageHandler: MessageHandler | null = null;
    private historyHandler: HistoryHandler | null = null;
    private userJoinedHandler: PresenceHandler | null = null;
    private userLeftHandler: PresenceHandler | null = null;
    private initialUsersHandler: ((users: Ably.Types.PresenceMessage[]) => void) | null = null;
    private playerUpdateHandler: PlayerUpdateHandler | null = null;
    private knockHandler: KnockHandler | null = null;

    constructor() {
        this.ably = new Ably.Realtime({
            authUrl: '/api/ably-token',
            authMethod: 'POST',
        });
        
        const channelOptions: Ably.Types.ChannelOptions = {
            params: { rewind: '25' },
            // NOTE: This enables End-to-End encryption.
            cipher: {
                algorithm: 'aes',
                keyLength: 256,
                mode: 'cbc',
                key: E2E_KEY
            }
        };

        this.pixelSpaceChannel = this.ably.channels.get('pixel-space', channelOptions);
        this.whiteboardChannel = this.ably.channels.get('whiteboard', channelOptions);


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

    public getClientId(): string {
        return this.ably.auth.clientId;
    }

    public async subscribeToEvents(): Promise<void> {
        await this.connectionPromise;
        
        this.pixelSpaceChannel.subscribe('message', (message) => {
            if (this.messageHandler) {
                this.messageHandler(message);
            }
        });
        
        this.pixelSpaceChannel.subscribe('player-update', (message) => {
            if (this.playerUpdateHandler) {
                this.playerUpdateHandler(message);
            }
        });
        
        this.pixelSpaceChannel.subscribe('knock', (message) => {
            const data = message.data as KnockData;
            // Only process the knock if this client is the target
            if (this.knockHandler && data.targetClientId === this.getClientId()) {
                this.knockHandler(data);
            }
        });

        this.pixelSpaceChannel.history((err, result) => {
            if (!err && result.items && this.historyHandler) {
                this.historyHandler(result.items);
            }
        });

        this.pixelSpaceChannel.presence.subscribe('enter', (member) => {
            if (this.userJoinedHandler) {
                this.userJoinedHandler(member);
            }
        });
        
        this.pixelSpaceChannel.presence.subscribe('leave', (member) => {
             if (this.userLeftHandler) {
                this.userLeftHandler(member);
            }
        });

        this.pixelSpaceChannel.presence.get((err, members) => {
            if (!err && members && this.initialUsersHandler) {
                this.initialUsersHandler(members);
            }
        });
    }
    
    public onMessage(handler: MessageHandler): void {
        this.messageHandler = handler;
    }

    public onPlayerUpdate(handler: PlayerUpdateHandler): void {
        this.playerUpdateHandler = handler;
    }
    
    public onKnock(handler: KnockHandler): void {
        this.knockHandler = handler;
    }
    
    public onHistory(handler: HistoryHandler): void {
        this.historyHandler = handler;
    }

    public onUserJoined(handler: PresenceHandler): void {
        this.userJoinedHandler = handler;
    }

    public onUserLeft(handler: PresenceHandler): void {
        this.userLeftHandler = handler;
    }
    
    public onInitialUsers(handler: (users: Ably.Types.PresenceMessage[]) => void): void {
        this.initialUsersHandler = handler;
    }

    public async enterPresence(userData: PresenceData) {
        await this.connectionPromise;
        this.pixelSpaceChannel.presence.enter(userData);
    }
    
    public sendMessage(text: string, data?: { author: string }): void {
        this.pixelSpaceChannel.publish('message', { text, ...data });
    }

    public sendKnock(targetClientId: string, fromEmail: string): void {
        const knockData: KnockData = {
            targetClientId,
            fromClientId: this.getClientId(),
            fromEmail: fromEmail
        };
        this.pixelSpaceChannel.publish('knock', knockData);
    }
    
    public broadcastPlayerPosition(x: number, y: number, email: string, clientId: string): void {
        const event: PlayerUpdateData = {
            type: 'move',
            payload: { x, y, email, clientId }
        };
        this.pixelSpaceChannel.publish('player-update', event);
    }

    public disconnect(): void {
        this.ably.close();
    }
}

export const realtimeService = new RealtimeService();
export { RealtimeService };

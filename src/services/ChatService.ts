
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
    x: number;
    y: number;
    email: string;
    clientId: string;
}

type MessageHandler = (message: Ably.Types.Message) => void;
type HistoryHandler = (messages: Ably.Types.Message[]) => void;
type PresenceHandler = (presenceMessage: Ably.Types.PresenceMessage) => void;
type PlayerUpdateHandler = (message: Ably.Types.Message) => void;

class ChatService {
    private ably: Ably.Realtime;
    private channel: Ably.Types.RealtimeChannel;

    private messageHandler: MessageHandler | null = null;
    private historyHandler: HistoryHandler | null = null;
    private userJoinedHandler: PresenceHandler | null = null;
    private userLeftHandler: PresenceHandler | null = null;
    private initialUsersHandler: ((users: Ably.Types.PresenceMessage[]) => void) | null = null;
    private playerUpdateHandler: PlayerUpdateHandler | null = null;

    constructor() {
        this.ably = new Ably.Realtime({
            authUrl: '/api/ably-token',
            authMethod: 'POST',
        });

        this.channel = this.ably.channels.get('pixel-space', {
             params: { rewind: '25' }
        });

        this.ably.connection.on('connected', () => {
            console.log('Ably connected!');
        });

        this.ably.connection.on('closed', () => {
            console.log('Ably connection was closed.');
        });
    }

    public getClientId(): string {
        return this.ably.auth.clientId;
    }

    public subscribeToEvents(): void {
        this.channel.subscribe('message', (message) => {
            if (this.messageHandler) {
                this.messageHandler(message);
            }
        });
        
        this.channel.subscribe('player-update', (message) => {
            if (this.playerUpdateHandler) {
                this.playerUpdateHandler(message);
            }
        });

        this.channel.history((err, result) => {
            if (!err && result.items && this.historyHandler) {
                this.historyHandler(result.items);
            }
        });

        this.channel.presence.subscribe('enter', (member) => {
            if (this.userJoinedHandler) {
                this.userJoinedHandler(member);
            }
        });
        
        this.channel.presence.subscribe('leave', (member) => {
             if (this.userLeftHandler) {
                this.userLeftHandler(member);
            }
        });

        this.channel.presence.get((err, members) => {
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

    public enterPresence(userData: PresenceData): void {
        this.channel.presence.enter(userData);
    }
    
    public sendMessage(text: string, data?: { author: string }): void {
        this.channel.publish('message', { text, ...data });
    }
    
    public broadcastPlayerPosition(x: number, y: number, email: string, clientId: string): void {
        // No need to use the API endpoint anymore, we can publish directly
        this.channel.publish('player-update', { x, y, email, clientId });
    }

    public disconnect(): void {
        this.ably.close();
    }
}

export const chatService = new ChatService();

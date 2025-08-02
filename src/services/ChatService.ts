
'use client';

import * as Ably from 'ably';

// Define the shape of our message and presence data
export interface MessageData {
    author: string;
    text: string;
}

export interface PresenceData {
    email: string;
}

// Define the event handlers the UI can register
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
    private initialUsersHandler: ((users: string[]) => void) | null = null;
    private playerUpdateHandler: PlayerUpdateHandler | null = null;

    constructor() {
        // Instantiate Ably with a placeholder client ID
        this.ably = new Ably.Realtime({
            authUrl: '/api/ably-token',
            authMethod: 'POST',
            clientId: 'anonymous-' + Math.random().toString(36).substr(2, 9),
        });

        this.channel = this.ably.channels.get('pixel-space', {
             params: { rewind: '25' } // Request last 25 messages on attach
        });

        this.ably.connection.on('connected', () => {
            console.log('Ably connected!');
        });

        this.ably.connection.on('closed', () => {
            console.log('Ably connection was closed.');
        });
    }

    // Subscribe to all channel events at once
    public subscribeToEvents(): void {
        // Subscribe to new messages
        this.channel.subscribe('message', (message) => {
            if (this.messageHandler) {
                this.messageHandler(message);
            }
        });
        
        // Subscribe to player updates
        this.channel.subscribe('player-update', (message) => {
            if (this.playerUpdateHandler) {
                this.playerUpdateHandler(message);
            }
        });

        // Get message history
        this.channel.history((err, result) => {
            if (!err && result.items && this.historyHandler) {
                this.historyHandler(result.items);
            }
        });

        // Subscribe to members entering
        this.channel.presence.subscribe('enter', (member) => {
            if (this.userJoinedHandler) {
                this.userJoinedHandler(member);
            }
        });
        
        // Subscribe to members leaving
        this.channel.presence.subscribe('leave', (member) => {
             if (this.userLeftHandler) {
                this.userLeftHandler(member);
            }
        });

        // Get initial presence set
        this.channel.presence.get((err, members) => {
            if (!err && members && this.initialUsersHandler) {
                const userEmails = members.map(m => (m.data as PresenceData).email);
                this.initialUsersHandler(userEmails);
            }
        });
    }
    
    // Register event handlers
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
    
    public onInitialUsers(handler: (users: string[]) => void): void {
        this.initialUsersHandler = handler;
    }

    // Enter presence with user data
    public enterPresence(userData: PresenceData): void {
        this.channel.presence.enter(userData);
    }
    
    // Send a message
    public sendMessage(text: string, data?: { author: string }): void {
        this.channel.publish('message', { text, ...data });
    }

    // Disconnect from Ably
    public disconnect(): void {
        this.ably.close();
    }
}

export const chatService = new ChatService();

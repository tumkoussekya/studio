
'use client';

type MessagePayload = { author: string; text: string };
type UserListPayload = { users: string[] };

export class ChatService {
  private ws: WebSocket | null = null;
  private onMessageHandler: ((author: string, text: string) => void) | null = null;
  private onUserListHandler: ((users: string[]) => void) | null = null;

  connect(url: string, onOpen: () => void, onClose: () => void) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connected.');
        return;
    }
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      onOpen();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message' && message.payload) {
          const { author, text } = message.payload as MessagePayload;
          if (this.onMessageHandler) {
            this.onMessageHandler(author, text);
          }
        } else if (message.type === 'user-list' && message.payload) {
            const { users } = message.payload as UserListPayload;
            if (this.onUserListHandler) {
                this.onUserListHandler(users);
            }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      onClose();
      this.ws = null;
    };
  }

  sendMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        payload: { text }, // Author is added by the server
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: (author: string, text: string) => void) {
    this.onMessageHandler = handler;
  }
  
  onUserList(handler: (users: string[]) => void) {
    this.onUserListHandler = handler;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const chatService = new ChatService();

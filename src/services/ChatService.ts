
'use client';

export class ChatService {
  private ws: WebSocket | null = null;
  private onMessageHandler: ((author: string, text: string) => void) | null = null;

  connect(url: string, onOpen: () => void, onClose: () => void) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      onOpen();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message' && message.payload) {
          const { author, text } = message.payload;
          if (this.onMessageHandler) {
            this.onMessageHandler(author, text);
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

  sendMessage(author: string, text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        payload: { author, text },
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: (author: string, text: string) => void) {
    this.onMessageHandler = handler;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const chatService = new ChatService();

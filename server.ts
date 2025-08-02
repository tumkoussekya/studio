
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server started on port 8080');

wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    // Broadcast the message to all other clients
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: false });
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.send(JSON.stringify({ 
    type: 'message', 
    payload: { 
      author: 'Server', 
      text: 'Welcome to the chat!' 
    }
  }));
});

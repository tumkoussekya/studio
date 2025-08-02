
import { WebSocketServer, WebSocket } from 'ws';
import { verify } from 'jsonwebtoken';
import url from 'url';

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server started on port 8080');

// A simple in-memory map to store connected clients by user ID
const clients = new Map<string, { email: string; ws: WebSocket }>();

function broadcast(message: object) {
  const data = JSON.stringify(message);
  for (const client of clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function broadcastUserList() {
    const userList = Array.from(clients.values()).map(c => c.email);
    broadcast({ type: 'user-list', payload: { users: userList } });
}

wss.on('connection', function connection(ws, req) {
  const { query } = url.parse(req.url || '', true);
  const token = query.token as string | undefined;

  if (!token) {
    console.log('Connection attempt without token. Closing.');
    ws.close(1008, 'Token required');
    return;
  }

  let userId: string;
  let userEmail: string;

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string, email: string };
    userId = decoded.userId;
    userEmail = decoded.email;
  } catch (e) {
    console.log('Invalid token. Closing connection.');
    ws.close(1008, 'Invalid token');
    return;
  }
  
  // If user is already connected, close the old connection
  if (clients.has(userId)) {
    console.log(`User ${userEmail} reconnected, closing old connection.`);
    clients.get(userId)?.ws.close();
  }

  clients.set(userId, { email: userEmail, ws });
  console.log(`Client connected: ${userEmail} (ID: ${userId})`);

  // Announce the new user and send the current user list
  broadcastUserList();


  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received from %s: %s', userEmail, data);
    try {
        const parsedData = JSON.parse(data.toString());
        
        // Add author to message payload before broadcasting
        if (parsedData.type === 'message' && parsedData.payload) {
            const messageToBroadcast = {
                type: 'message',
                payload: {
                    author: userEmail,
                    text: parsedData.payload.text
                }
            };
            // Broadcast the message to all other clients
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageToBroadcast), { binary: false });
              }
            });
        }

    } catch(e) {
        console.error("Failed to parse or handle message", e);
    }

  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${userEmail}`);
    clients.delete(userId);
    // Announce user disconnection
    broadcastUserList();
  });

  ws.send(JSON.stringify({ 
    type: 'message', 
    payload: { 
      author: 'Server', 
      text: `Welcome, ${userEmail}!`
    }
  }));
});

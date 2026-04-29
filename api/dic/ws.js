// Simple WebSocket server for DIC real-time chat (Node.js, ws)
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Map nodeName => ws
const clientsByName = new Map();

wss.on('connection', function connection(ws) {
  ws.nodeName = null;

  ws.on('message', function incoming(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    // Node handshake: {type: 'register', name: 'NodeName'}
    if (msg.type === 'register' && msg.name) {
      ws.nodeName = msg.name;
      clientsByName.set(msg.name, ws);
      return;
    }

    // Direct message: {type: 'direct-message', to: 'NodeName', from: 'NodeName', text: '...'}
    if (msg.type === 'direct-message' && msg.to && msg.text) {
      const recipient = clientsByName.get(msg.to);
      if (recipient && recipient.readyState === WebSocket.OPEN) {
        recipient.send(
          JSON.stringify({
            type: 'direct-message',
            from: ws.nodeName || 'Anonymous Node',
            text: msg.text
          })
        );
      }
      return;
    }

    // Broadcast to all clients except sender (for other events)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function () {
    if (ws.nodeName) {
      clientsByName.delete(ws.nodeName);
    }
  });
});

server.listen(5001, () => {
  console.log('DIC WebSocket server running on ws://localhost:5001');
});

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import joinRoom from './handlers/join-room.js';
import updateEstimate from './handlers/update-estimate.js';
import resetRoom from './handlers/reset-room.js';
import removePlayer from './handlers/remove-player.js';
import { initialiseRoom, room } from './room.js';

const server = http.createServer((req, res) => {
	if (req.url === '/healthz') {
		res.writeHead(200);
		res.end('OK');
	} else {
		res.writeHead(404);
		res.end();
	}
});

const wss = new WebSocketServer({ server });

const eventHandlers = new Map();
eventHandlers.set('join-room', joinRoom);
eventHandlers.set('remove-player', removePlayer);
eventHandlers.set('reset-room', resetRoom);
eventHandlers.set('update-estimate', updateEstimate);

function onMessageHandler(message) {
	try {
		const event = JSON.parse(message);
		const { eventType, payload } = event;

		const eventHandler = eventHandlers.get(eventType);
		if (eventHandler) {
			eventHandler(payload);
		} else {
			console.log('Unknown message type:', eventType);
			return;
		}

		broadcast({ eventType: 'room-update', payload: room });
	} catch (error) {
		console.error('Error processing message:', error);
	}
}

function broadcast(message) {
	const serializedMessage = JSON.stringify(message);
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(serializedMessage);
		}
	});
}

wss.on('connection', (socket) => {
	console.log('A client connected.');

	socket.on('message', onMessageHandler);

	socket.on('close', () => {
		console.log('A client disconnected.');
	});

	socket.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

initialiseRoom();

const PORT = process.env.SERVER_PORT || 8080;
server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
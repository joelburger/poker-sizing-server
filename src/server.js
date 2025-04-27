import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import joinRoom from './handlers/join-room.js';
import updateEstimate from './handlers/update-estimate.js';
import resetRoom from './handlers/reset-room.js';
import removePlayer from './handlers/remove-player.js';
import { deleteStaleRooms, fetchRoom } from './common/room.js';
import validateMessage from './common/schema-validator.js';

const HEALTH_CHECK_PATH = process.env.HEALTH_CHECK_PATH || '/healthz';
const PORT = process.env.SERVER_PORT || 8080;

const EVENT_TYPES = {
	JOIN_ROOM: 'join-room',
	REMOVE_PLAYER: 'remove-player',
	RESET_ROOM: 'reset-room',
	UPDATE_ESTIMATE: 'update-estimate',
	ROOM_UPDATE: 'room-update'
};

const eventHandlers = new Map([
	[EVENT_TYPES.JOIN_ROOM, joinRoom],
	[EVENT_TYPES.REMOVE_PLAYER, removePlayer],
	[EVENT_TYPES.RESET_ROOM, resetRoom],
	[EVENT_TYPES.UPDATE_ESTIMATE, updateEstimate]
]);

const server = http.createServer((req, res) => {
	if (req.url === HEALTH_CHECK_PATH) {
		res.writeHead(200);
		res.end('OK');
	} else {
		res.writeHead(404);
		res.end();
	}
});

const wss = new WebSocketServer({ server });

function onMessageHandler(message) {
	try {
		const event = JSON.parse(message);
		const validationResult = validateMessage(event);

		if (!validationResult) {
			console.error(`Invalid message: ${JSON.stringify(event)}. Validation errors: ${JSON.stringify(validateMessage.errors)}`);
			return;
		}

		const { eventType, payload } = event;
		const { sessionId } = payload;

		const eventHandler = eventHandlers.get(eventType);
		if (eventHandler) {
			eventHandler(payload);
		} else {
			console.error('Unknown message type:', eventType);
			return;
		}

		broadcast({ eventType: EVENT_TYPES.ROOM_UPDATE, payload: fetchRoom(sessionId) });
	} catch (error) {
		console.error('Error processing message:', error);
	}
}

function broadcast(message) {
	const serialisedMessage = JSON.stringify(message);
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(serialisedMessage);
		}
	});
}

function startCleanupJob() {
	setInterval(() => {
		deleteStaleRooms();
	}, 60 * 1000);
}

wss.on('connection', (socket, request) => {
	const clientAddress = request.socket.remoteAddress;
	console.log(`A client connected from ${clientAddress}.`);

	socket.on('message', onMessageHandler);

	socket.on('close', () => {
		console.log(`Client from ${clientAddress} disconnected.`);
	});

	socket.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

startCleanupJob();

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});


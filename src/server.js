import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import joinRoom from './handlers/join-room.js';
import updateEstimate from './handlers/update-estimate.js';
import resetRoom from './handlers/reset-room.js';
import deletePlayer from './handlers/delete-player.js';
import { fetchRoom } from './common/room.js';
import validateMessage from './common/schema-validator.js';
import { connectToRedis, disconnectFromRedis } from './common/redis-util.js';
import { HEALTH_CHECK_PATH, HTTP_SERVER_PORT, REDIS_URL } from './common/config.js';

const EVENT_TYPES = {
	JOIN_ROOM: 'join-room',
	REMOVE_PLAYER: 'remove-player',
	RESET_ROOM: 'reset-room',
	UPDATE_ESTIMATE: 'update-estimate',
	ROOM_UPDATE: 'room-update'
};

const eventHandlers = new Map([
	[EVENT_TYPES.JOIN_ROOM, joinRoom],
	[EVENT_TYPES.REMOVE_PLAYER, deletePlayer],
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

async function onMessageHandler(message) {
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
			await eventHandler(payload);
		} else {
			console.error('Unknown message type:', eventType);
			return;
		}

		const room = await fetchRoom(sessionId);
		broadcast({ eventType: EVENT_TYPES.ROOM_UPDATE, payload: room });
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

server.listen(HTTP_SERVER_PORT, () => {
	connectToRedis(REDIS_URL).then(() => {
		console.log(`Server listening on http://localhost:${HTTP_SERVER_PORT}`);
	});
});

server.on('close', () => {
	disconnectFromRedis().then(() => {
		console.log('Server has stopped listening.');
	});
});
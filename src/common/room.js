import { calculateMean, calculateMedian } from './math-util.js';

const roomExpiryMs = process.env.ROOM_EXPIRY_MS || 60 * 60 * 1000; // 1 hour in milliseconds
const rooms = new Map();

function deleteStaleRooms() {
	const now = Date.now();

	rooms.forEach((room, sessionId) => {
		const lastUpdated = new Date(room.updatedAt).getTime();
		if (now - lastUpdated > roomExpiryMs) {
			console.log(`Deleting stale room with sessionId: ${sessionId}`);
			rooms.delete(sessionId);
		}
	});
}

function fetchRoom(sessionId) {
	if (rooms.has(sessionId)) {
		return rooms.get(sessionId);
	}

	const room = {
		sessionId,
		players: new Map(),
		status: 'PENDING',
		createdAt: new Date().toISOString(),
		summary: {}
	};

	rooms.set(sessionId, room);

	return room;
}

function haveAllPlayersEstimated(room) {
	return room.players.size > 0 && !Array.from(room.players.values()).some(player => player.estimate === null);
}

function calculateSummary(room) {
	const estimates = Array.from(room.players.values())
		.map(player => player.estimate)
		.filter(estimate => estimate !== null);

	if (estimates.length === 0) {
		return { mean: null, median: null };
	}

	const mean = calculateMean(estimates);
	const median = calculateMedian(estimates);

	return { mean, median };
}

function updateRoomStatus(room) {
	if (haveAllPlayersEstimated(room)) {
		room.status = 'COMPLETED';
		room.summary = calculateSummary(room);
	}
	room.updatedAt = new Date().toISOString();
	room.playerList = Array.from(room.players.values());
}

export { fetchRoom, updateRoomStatus, deleteStaleRooms };

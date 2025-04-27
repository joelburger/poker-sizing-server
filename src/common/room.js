import { calculateMean, calculateMedian } from './math-util.js';

const rooms = new Map();

function fetchRoom(sessionId) {
	if (rooms.has(sessionId)) {
		return rooms.get(sessionId);
	}

	const room = {
		sessionId,
		players: new Map(),
		status: 'PENDING',
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

	room.playerList = Array.from(room.players.values());
}

export { fetchRoom, updateRoomStatus };

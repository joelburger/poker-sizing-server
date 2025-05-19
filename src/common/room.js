import { calculateMean, calculateMedian } from './math-util.js';
import { getValue, setValue } from './redis-util.js';
import { ROOM_EXPIRY_SECONDS } from './config.js';

function hasPlayer(room, playerId) {
	return room.players.some((player) => player.id === playerId);
}

function findPlayer(room, playerId) {
	return room.players.find((player) => player.id === playerId);
}

function removePlayer(room, playerId) {
	room.players = room.players.filter((player) => player.id !== playerId);
}

async function fetchRoom(sessionId) {
	const room = await getValue(sessionId);

	if (room) {
		return room;
	}

	const newRoom = {
		sessionId,
		players: [],
		status: 'PENDING',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		summary: {},
	};

	await setValue(sessionId, newRoom, ROOM_EXPIRY_SECONDS);

	return newRoom;
}

function haveAllPlayersEstimated(room) {
	return room.players.length > 0 && !room.players.some(player => player.estimate === null);
}

function calculateSummary(room) {
	const estimates = room.players.map(player => player.estimate).filter(estimate => estimate !== null);

	if (estimates.length === 0) {
		return { mean: null, median: null };
	}

	const mean = calculateMean(estimates);
	const median = calculateMedian(estimates);

	return { mean, median };
}

async function updateRoom(room) {
	if (haveAllPlayersEstimated(room)) {
		room.status = 'COMPLETED';
		room.summary = calculateSummary(room);
	}

	if (room.players.length === 0) {
		room.status = 'PENDING';
		room.summary = {};
	}

	room.updatedAt = new Date().toISOString();

	await setValue(room.sessionId, room, ROOM_EXPIRY_SECONDS);
}

function resetVoting(room) {
	room.players.forEach(player => player.estimate = null);
	room.status = 'PENDING';
	room.summary = {};
}

export { fetchRoom, updateRoom, hasPlayer, findPlayer, removePlayer, resetVoting };

import { v4 as uuidv4 } from 'uuid';
import { calculateMean, calculateMedian } from '../math-util.js';

let room;

function initialiseRoom(roomId) {
	room = {
		roomId,
		players: new Map(),
		status: 'PENDING',
		summary: {}
	};
}

function haveAllPlayersEstimated() {
	return room.players.size > 0 && !Array.from(room.players.values()).some(player => player.estimate === null);
}

function calculateSummary() {
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

function finaliseRoomState() {
	if (haveAllPlayersEstimated()) {
		room.status = 'COMPLETED';
		room.summary = calculateSummary();
	}

	room.playerList = Array.from(room.players.values());
}

export { initialiseRoom, finaliseRoomState, room };

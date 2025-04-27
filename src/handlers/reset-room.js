import { fetchRoom } from '../common/room.js';

export default function resetRoom(payload) {
	const { playerId, sessionId } = payload;

	console.log(`Player ${playerId} has reset the room`);

	const room = fetchRoom(sessionId);

	room.players.forEach(player => player.estimate = null);
	room.status = 'PENDING';
	room.summary = {};
}
import { room } from '../room.js';

export default function resetRoom(payload) {
	const { playerId } = payload;

	console.log(`Player ${playerId} has reset the room`);

	room.players.forEach(player => player.estimate = null);
	room.status = 'PENDING';
	room.summary = {};
}
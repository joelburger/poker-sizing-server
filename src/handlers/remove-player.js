import { finaliseRoomState, room } from '../room.js';
import resetRoom from './reset-room.js';

export default function removePlayer(payload) {
	const { deletePlayerId, playerId } = payload;

	if (room.players.has(deletePlayerId)) {
		room.players.delete(deletePlayerId);
		console.log(`Player ${deletePlayerId} has been removed from the room by ${playerId}`);
	} else {
		console.error(`Player ${deletePlayerId} does not exist in the room.`);
	}

	if (room.players.size === 0) {
		resetRoom(playerId);
	}

	finaliseRoomState();
}

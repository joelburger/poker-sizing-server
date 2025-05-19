import { updateRoom, fetchRoom, hasPlayer, removePlayer } from '../common/room.js';
import resetRoom from './reset-room.js';

export default async function deletePlayer(payload) {
	const { deletePlayerId, playerId, sessionId } = payload;

	const room = await fetchRoom(sessionId);

	if (hasPlayer(room, deletePlayerId)) {
		removePlayer(room, deletePlayerId);
		console.log(`Player ${deletePlayerId} has been removed from the room by ${playerId}`);
	} else {
		console.error(`Player ${deletePlayerId} does not exist in the room.`);
	}

	await updateRoom(room);
}

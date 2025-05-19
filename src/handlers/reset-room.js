import { fetchRoom, resetVoting, updateRoom } from '../common/room.js';

export default async function resetRoom(payload) {
	const { playerId, sessionId } = payload;

	console.log(`Player ${playerId} has reset the room`);

	const room = await fetchRoom(sessionId);
	resetVoting(room);

	await updateRoom(room);
}
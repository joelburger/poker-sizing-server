import { updateRoom, fetchRoom, hasPlayer, findPlayer } from '../common/room.js';

export default async function updateEstimate(payload) {
	const { playerId, estimate, sessionId } = payload

	console.log(`Player ${playerId} has voted ${estimate}.`);

	const room = await fetchRoom(sessionId);

	if (!hasPlayer(room, playerId)) {
		console.error(`Player ${playerId} does not exist`);
		return;
	}

	const player = findPlayer(room, playerId);
	player.estimate = estimate;

	await updateRoom(room);
}

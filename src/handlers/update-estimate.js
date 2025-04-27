import { updateRoomStatus, fetchRoom } from '../common/room.js';

export default function updateEstimate(payload) {
  const {playerId, estimate, sessionId } = payload

	console.log(`Player ${playerId} has voted ${estimate}.`);

	const room = fetchRoom(sessionId);

	if (!room.players.has(playerId)) {
		console.error(`Player ${playerId} does not exist`);
		return;
	}

	const player = room.players.get(playerId);

	player.estimate = estimate;

	updateRoomStatus(room);
}

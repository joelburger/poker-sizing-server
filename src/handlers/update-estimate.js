import { finaliseRoomState, room } from '../room.js';

export default function updateEstimate(payload) {
  const {playerId, estimate} = payload

	console.log(`Player ${playerId} has voted ${estimate}.`);

	if (!room.players.has(playerId)) {
		console.error(`Player ${playerId} does not exist`);
		return;
	}

	const player = room.players.get(playerId);

	player.estimate = estimate;

	finaliseRoomState();
}

import { room, finaliseRoomState } from '../room.js';

export default function joinRoom(payload) {
	const { playerId, playerName } = payload;

	if (!/^[A-Za-z]{1,40}$/.test(playerName)) {
		console.error('Invalid player name. It must contain only letters and be up to 40 characters long.');
		return;
	}

	if (room.players.has(playerId)) {
		console.log(`Player ${playerId} changed names.`);

		const player = room.players.get(playerId);
		player.name = playerName;
	} else {
		console.log(`Player ${playerId} joined room.`);

		room.players.set(playerId, { id: playerId, name: playerName, estimate: null });
	}

	finaliseRoomState();
}
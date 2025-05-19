import { fetchRoom, findPlayer, hasPlayer, updateRoom } from '../common/room.js';

export default async function joinRoom(payload) {
	const { sessionId, playerId, playerName } = payload;

	if (!/^[A-Za-z]{1,40}$/.test(playerName)) {
		console.error('Invalid player name. It must contain only letters and be up to 40 characters long.');
		return;
	}

	const room = await fetchRoom(sessionId);

	if (hasPlayer(room, playerId)) {
		console.log(`Player ${playerId} changed names.`);

		const player = findPlayer(room, playerId);
		player.name = playerName;
	} else {
		console.log(`Player ${playerId} joined room.`);

		room.players.push({ id: playerId, name: playerName, estimate: null });
	}

	await updateRoom(room);
}
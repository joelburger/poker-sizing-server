import {WebSocketServer, WebSocket} from 'ws';
import {v4 as uuidv4} from 'uuid';

const wss = new WebSocketServer({port: 8080});

let room;

function convertPlayerMapToArray() {
    room.playerList = Array.from(room.players.values());
}

function broadcast(message) {
    const serializedMessage = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
        }
    });
}

function initialiseRoom() {
    room = {
        roomId: uuidv4(),
        players: new Map(),
        status: 'PENDING',
        summary: {}
    };
}

function addPlayerToRoom(playerId, playerName) {
    if (room.players.has(playerId)) {
        const player = room.players.get(playerId);
        player.name = playerName;
    } else {
        room.players.set(playerId, {id: playerId, name: playerName, estimate: null});
    }
}

function resetRoom(playerId) {
    console.log(`Player ${playerId} has reset the room`);
    room.players.forEach(player => player.estimate = null);
    room.status = 'PENDING';
    room.summary = {};
}

function haveAllPlayersEstimated() {

    return room.players.size > 0 && !Array.from(room.players.values()).some(player => player.estimate === null);
}

function updatePlayerEstimate(playerId, estimate) {
    if (!room.players.has(playerId)) {
        console.error(`Player ${playerId} does not exist`);
        return;
    }

    const player = room.players.get(playerId);

    player.estimate = estimate;
}

function calculateSummary() {
    const estimates = Array.from(room.players.values())
        .map(player => player.estimate)
        .filter(estimate => estimate !== null);

    if (estimates.length === 0) {
        return {mean: null, median: null};
    }

    const mean = Math.round(estimates.reduce((sum, value) => sum + value, 0) / estimates.length);

    estimates.sort((a, b) => a - b);
    const mid = Math.floor(estimates.length / 2);
    const median = estimates.length % 2 === 0
        ? (estimates[mid - 1] + estimates[mid]) / 2
        : estimates[mid];

    return {mean, median};

}

function removePlayer(deletePlayerId, playerId) {
    if (room.players.has(deletePlayerId)) {
        room.players.delete(deletePlayerId);
        console.log(`Player ${deletePlayerId} has been removed from the room by ${playerId}`);
    } else {
        console.error(`Player ${deletePlayerId} does not exist in the room.`);
    }

    if (room.players.size === 0) {
        resetRoom(playerId);
    }
}

initialiseRoom();

wss.on('connection', (socket) => {
    console.log('A client connected.');

    socket.on('message', (data) => {
        try {
            const event = JSON.parse(data);
            const {eventType, payload} = event;
            const {playerId} = payload;

            if (eventType === 'join-room') {
                addPlayerToRoom(playerId, payload.playerName);
            } else if (eventType === 'update-estimate') {
                updatePlayerEstimate(playerId, payload.estimate);
            } else if (eventType === 'reset-room') {
                resetRoom(playerId);
            } else if (eventType === 'remove-player') {
                removePlayer(payload.deletePlayerId, playerId);
            } else {
                console.log('Unknown message type:', eventType);
                return;
            }

            if (haveAllPlayersEstimated()) {
                room.status = "COMPLETED";
                room.summary = calculateSummary();
            }

            convertPlayerMapToArray();
            broadcast({eventType: 'room-update', payload: room});
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    socket.on('close', () => {
        console.log('A client disconnected.');
    });

    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
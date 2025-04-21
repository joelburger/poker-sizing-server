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
        players: new Map()
    };
}

function addPlayerToRoom(playerId, playerName) {
    room.players.set(playerId,  {id: playerId, name: playerName, estimate: null});
}

function updatePlayerEstimate(playerId, estimate) {

    if (!room.players.has(playerId)) {
        console.error(`Player ${playerId} does not exist`);
        return;
    }

    const player = room.players.get(playerId);

    player.estimate = estimate;
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
            } else {
                console.log('Unknown message type:', eventType);
                return;
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
import {WebSocketServer, WebSocket} from 'ws';
import {v4 as uuidv4} from 'uuid';

const wss = new WebSocketServer({port: 8080});

let room;

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
        players: {}
    };
}

function addPlayerToRoom(playerId, playerName) {
    room.players[playerId] =  {id: playerId, name: playerName, estimate: null};
}

initialiseRoom();

wss.on('connection', (socket) => {
    console.log('A client connected.');

    socket.on('message', (data) => {
        try {
            const event = JSON.parse(data);
            const {eventType, payload} = event;
            const {playerId, playerName} = payload;
            if (eventType === 'join-room') {
                addPlayerToRoom(playerId, playerName);
                broadcast({eventType: 'room-update', payload: room});
            } else {
                console.log('Unknown message type:', eventType);
            }
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
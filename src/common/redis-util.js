import { createClient } from 'redis';

let client;

async function connectToRedis(redisUrl) {
	if (!client) {
		client = createClient({ url: redisUrl });

		client.on('ready', () => {
			console.log(`Redis client connected to ${redisUrl}`);
		});

		client.on('error', (err) => console.error('Redis client error', err));

		await client.connect();
	}
}

async function disconnectFromRedis() {
	if (client) {
		await client.disconnect();
		client = null;
	}
}

async function getValue(key) {
	if (!client) {
		throw new Error('Redis client is not connected');
	}
	const result = await client.get(key);
	return result ? JSON.parse(result) : null;
}

async function setValue(key, value, expiryInSeconds = 86400) { // Default expiry: 1 hour
	if (!client) {
		throw new Error('Redis client is not connected');
	}
	await client.set(key, JSON.stringify(value), { EX: expiryInSeconds });
}

export {
	connectToRedis,
	disconnectFromRedis,
	getValue,
	setValue
};

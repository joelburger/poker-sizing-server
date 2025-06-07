import Ajv from 'ajv';

const ajv = new Ajv();

const messageSchema = {
	type: 'object',
	properties: {
		eventType: { type: 'string', pattern: '^[a-zA-Z-]+$' },
		payload: {
			type: 'object',
			properties: {
				sessionId: { type: 'string', pattern: '^[a-zA-Z0-9-_]+$' },
				playerId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
				deletePlayerId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
				estimate: { type: ['number', 'null'] },
				playerName: { type: 'string', pattern: '^[a-zA-Z]{1,20}$' },
				avatar: { type: ['string', 'null']},
			},
			required: ['sessionId', 'playerId'],
			additionalProperties: false
		}
	},
	required: ['eventType', 'payload'],
	additionalProperties: false
};

const validateMessage = ajv.compile(messageSchema);

export default validateMessage;

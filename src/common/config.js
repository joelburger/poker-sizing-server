const HEALTH_CHECK_PATH = process.env.HEALTH_CHECK_PATH || '/healthz';
const HTTP_SERVER_PORT = process.env.SERVER_PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const ROOM_EXPIRY_SECONDS = process.env.ROOM_EXPIRY_SECONDS ? parseInt(process.env.ROOM_EXPIRY_SECONDS) : 3600;

export { HEALTH_CHECK_PATH, HTTP_SERVER_PORT, REDIS_URL, ROOM_EXPIRY_SECONDS };
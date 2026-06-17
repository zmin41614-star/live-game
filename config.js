// Application Configuration

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || 'localhost'
    },

    // TikTok API Configuration
    tiktok: {
        apiKey: process.env.TIKTOK_API_KEY,
        apiSecret: process.env.TIKTOK_API_SECRET,
        redirectUri: process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/auth/callback',
        scopes: [
            'user.info.basic',
            'video.list',
            'user_info.stats'
        ]
    },

    // Database Configuration
    database: {
        mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-live-game',
        type: process.env.DB_TYPE || 'mongodb' // 'mongodb' or 'firebase'
    },

    // Game Configuration
    game: {
        defaultRoundDuration: 30, // seconds
        maxPlayers: 1000,
        minPlayers: 1,
        maxOptions: 4,
        minOptions: 2,
        roundTimeout: 60000, // milliseconds
        messageQueueSize: 100
    },

    // WebSocket Configuration
    websocket: {
        pingInterval: 30000, // 30 seconds
        pongTimeout: 5000, // 5 seconds
        maxClientMessageSize: 64 * 1024 // 64KB
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined',
        maxFileSize: '10m',
        maxFiles: 5
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};

module.exports = config;





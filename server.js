const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Game State Management
const gameState = {
    activePlayers: new Set(),
    currentRound: 1,
    gameActive: false,
    tiktokConnected: false,
    viewers: [],
    messages: [],
    votes: {}
};

// =====================================================
// TIKTOK LIVE CONNECTION (WebSocket)
// =====================================================

class TikTokLiveManager {
    constructor() {
        this.username = null;
        this.connected = false;
        this.client = null;
    }

    async connect(username) {
        this.username = username;
        console.log(` Connecting to TikTok Live: @${username}`);
        
        try {
            // Simulate TikTok Live connection
            // For real implementation, use tiktok-live-connector library:
            // const TikTokLiveConnection = require('tiktok-live-connector');
            // this.client = new TikTokLiveConnection({ username });
            
            this.connected = true;
            gameState.tiktokConnected = true;
            
            // Simulate live messages
            this.simulateMessages();
            
            console.log(' Connected to TikTok Live');
            return true;
        } catch (error) {
            console.error(' Connection failed:', error);
            this.connected = false;
            return false;
        }
    }

    simulateMessages() {
        const demoMessages = [
            'Red!', 'Blue!', 'Yellow!', 'Green!',
            'vote 1', 'vote 2', 'vote 3', 'vote 4',
            'option 1', 'option 2', 'this one', 'that one'
        ];

        const demoUsers = [
            'viewer1', 'viewer2', 'viewer3', 'viewer4', 'viewer5',
            'fan_user', 'live_viewer', 'tiktok_user', 'gamer123'
        ];

        setInterval(() => {
            if (gameState.gameActive && Math.random() > 0.6) {
                const username = demoUsers[Math.floor(Math.random() * demoUsers.length)];
                const message = demoMessages[Math.floor(Math.random() * demoMessages.length)];
                this.onMessage(username, message);
            }
        }, 1500);
    }

    onMessage(username, message) {
        const userData = {
            username,
            message,
            timestamp: new Date().toISOString()
        };

        gameState.messages.push(userData);
        
        // Add viewer if new
        if (!gameState.viewers.find(v => v.username === username)) {
            gameState.viewers.push({ username, joinTime: new Date() });
        }

        // Process vote from message
        this.processVote(username, message);

        // Broadcast to all WebSocket clients
        broadcastMessage({
            type: 'chat',
            username,
            message,
            viewerCount: gameState.viewers.length,
            totalMessages: gameState.messages.length
        });
    }

    processVote(username, message) {
        const msg = message.toLowerCase().trim();
        let optionIndex = null;

        if (msg.includes('1') || msg.includes('red') || msg.includes('first')) optionIndex = 0;
        else if (msg.includes('2') || msg.includes('blue') || msg.includes('second')) optionIndex = 1;
        else if (msg.includes('3') || msg.includes('yellow') || msg.includes('third')) optionIndex = 2;
        else if (msg.includes('4') || msg.includes('green') || msg.includes('fourth')) optionIndex = 3;

        if (optionIndex !== null) {
            if (!gameState.votes[optionIndex]) {
                gameState.votes[optionIndex] = 0;
            }
            gameState.votes[optionIndex]++;

            broadcastMessage({
                type: 'vote',
                votes: gameState.votes,
                totalVotes: Object.values(gameState.votes).reduce((a, b) => a + b, 0)
            });
        }
    }

    disconnect() {
        this.connected = false;
        gameState.tiktokConnected = false;
        console.log(' Disconnected from TikTok Live');
    }
}

const tiktokManager = new TikTokLiveManager();

// =====================================================
// WEBSOCKET HANDLERS
// =====================================================

wss.on('connection', (ws) => {
    console.log(' New WebSocket client connected');
    gameState.activePlayers.add(ws);

    // Send initial state
    ws.send(JSON.stringify({
        type: 'init',
        gameState: gameState,
        viewers: gameState.viewers.length
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('Message parse error:', error);
        }
    });

    ws.on('close', () => {
        console.log(' Client disconnected');
        gameState.activePlayers.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'vote':
            console.log(`Vote: ${data.option}`);
            break;
        case 'chat':
            console.log(`Chat: ${data.message}`);
            break;
        case 'gameControl':
            handleGameControl(data.action);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function broadcastMessage(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// =====================================================
// GAME CONTROL ROUTES
// =====================================================

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/start-game', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }

    const connected = await tiktokManager.connect(username);

    if (connected) {
        gameState.gameActive = true;
        gameState.votes = {};
        gameState.messages = [];
        gameState.viewers = [];

        broadcastMessage({
            type: 'gameStart',
            username,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: `Connected to @${username}'s TikTok Live`,
            gameState
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Failed to connect to TikTok Live'
        });
    }
});

app.post('/api/stop-game', (req, res) => {
    gameState.gameActive = false;
    tiktokManager.disconnect();

    broadcastMessage({
        type: 'gameEnd',
        results: gameState.votes,
        totalMessages: gameState.messages.length,
        totalViewers: gameState.viewers.length
    });

    res.json({
        success: true,
        results: {
            totalVotes: Object.values(gameState.votes).reduce((a, b) => a + b, 0),
            totalMessages: gameState.messages.length,
            totalViewers: gameState.viewers.length,
            votes: gameState.votes
        }
    });
});

app.post('/api/end-round', (req, res) => {
    const totalVotes = Object.values(gameState.votes).reduce((a, b) => a + b, 0);
    const winnerIndex = Object.keys(gameState.votes).reduce((a, b) => 
        gameState.votes[b] > gameState.votes[a] ? b : a
    );

    const results = {
        round: gameState.currentRound,
        votes: gameState.votes,
        totalVotes,
        winner: parseInt(winnerIndex) + 1
    };

    gameState.currentRound++;
    gameState.votes = {};

    broadcastMessage({
        type: 'roundEnd',
        results
    });

    res.json({ success: true, results });
});

app.get('/api/game-status', (req, res) => {
    res.json({
        gameActive: gameState.gameActive,
        tiktokConnected: gameState.tiktokConnected,
        currentRound: gameState.currentRound,
        viewers: gameState.viewers.length,
        totalMessages: gameState.messages.length,
        votes: gameState.votes,
        activePlayers: gameState.activePlayers.size
    });
});

app.get('/api/leaderboard', (req, res) => {
    const leaderboard = gameState.viewers
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    res.json({
        leaderboard,
        totalViewers: gameState.viewers.length
    });
});

app.get('/api/messages', (req, res) => {
    const limit = req.query.limit || 50;
    const messages = gameState.messages.slice(-limit);
    res.json({ messages, total: gameState.messages.length });
});

// =====================================================
// ERROR HANDLING & SERVER START
// =====================================================

app.use((err, req, res, next) => {
    console.error(' Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

server.listen(PORT, () => {
    console.log(`

   TikTok Live Interactive Game       
   Server running on port ${PORT}    
   http://localhost:${PORT}          

    `);
});

module.exports = { tiktokManager, gameState, broadcastMessage };

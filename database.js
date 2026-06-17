// Firebase/MongoDB Database Integration
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// =====================================================
// MONGODB SCHEMAS
// =====================================================

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true },
    tiktokUsername: String,
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    duration: Number,
    rounds: Number,
    totalViewers: Number,
    totalMessages: Number,
    status: { type: String, enum: ['active', 'completed', 'cancelled'] },
    results: mongoose.Schema.Types.Mixed
});

const roundSchema = new mongoose.Schema({
    gameId: String,
    roundNumber: Number,
    question: String,
    options: [String],
    votes: [Number],
    winner: Number,
    duration: Number,
    timestamp: { type: Date, default: Date.now }
});

const viewerSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    joinTime: { type: Date, default: Date.now },
    totalVotes: { type: Number, default: 0 },
    participatedGames: [String],
    stats: {
        correctVotes: { type: Number, default: 0 },
        wrongVotes: { type: Number, default: 0 },
        score: { type: Number, default: 0 }
    }
});

const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    gameId: String,
    roundId: String,
    timestamp: { type: Date, default: Date.now },
    containsVote: Boolean,
    voteOption: Number
});

// =====================================================
// MONGOOSE MODELS
// =====================================================

const Game = mongoose.model('Game', gameSchema);
const Round = mongoose.model('Round', roundSchema);
const Viewer = mongoose.model('Viewer', viewerSchema);
const Message = mongoose.model('Message', messageSchema);

// =====================================================
// DATABASE FUNCTIONS
// =====================================================

class GameDatabase {
    constructor() {
        this.connected = false;
    }

    async connect(mongoUri = process.env.MONGODB_URI) {
        try {
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            this.connected = true;
            console.log(' MongoDB connected');
        } catch (error) {
            console.error(' MongoDB connection failed:', error);
            this.connected = false;
        }
    }

    async createGame(tiktokUsername) {
        try {
            const gameId = `game_${Date.now()}`;
            const game = new Game({
                gameId,
                tiktokUsername,
                status: 'active'
            });
            await game.save();
            console.log(' Game created:', gameId);
            return game;
        } catch (error) {
            console.error(' Failed to create game:', error);
            return null;
        }
    }

    async saveRound(gameId, roundData) {
        try {
            const round = new Round({
                gameId,
                ...roundData,
                timestamp: new Date()
            });
            await round.save();
            console.log(' Round saved');
            return round;
        } catch (error) {
            console.error(' Failed to save round:', error);
            return null;
        }
    }

    async saveViewer(username) {
        try {
            let viewer = await Viewer.findOne({ username });
            if (!viewer) {
                viewer = new Viewer({ username });
                await viewer.save();
                console.log(' New viewer registered:', username);
            }
            return viewer;
        } catch (error) {
            console.error(' Failed to save viewer:', error);
            return null;
        }
    }

    async saveMessage(messageData) {
        try {
            const message = new Message(messageData);
            await message.save();
            return message;
        } catch (error) {
            console.error(' Failed to save message:', error);
            return null;
        }
    }

    async updateViewerStats(username, voteCorrect) {
        try {
            const viewer = await Viewer.findOne({ username });
            if (viewer) {
                viewer.stats.totalVotes++;
                if (voteCorrect) {
                    viewer.stats.correctVotes++;
                    viewer.stats.score += 10;
                } else {
                    viewer.stats.wrongVotes++;
                }
                await viewer.save();
            }
        } catch (error) {
            console.error(' Failed to update viewer stats:', error);
        }
    }

    async getLeaderboard(limit = 10) {
        try {
            const leaderboard = await Viewer.find()
                .sort({ 'stats.score': -1 })
                .limit(limit);
            return leaderboard;
        } catch (error) {
            console.error(' Failed to get leaderboard:', error);
            return [];
        }
    }

    async getGameStats(gameId) {
        try {
            const game = await Game.findOne({ gameId });
            const rounds = await Round.find({ gameId });
            return {
                game,
                rounds,
                totalRounds: rounds.length
            };
        } catch (error) {
            console.error(' Failed to get game stats:', error);
            return null;
        }
    }

    async closeGame(gameId) {
        try {
            const game = await Game.findOneAndUpdate(
                { gameId },
                { 
                    status: 'completed',
                    endTime: new Date(),
                    duration: Date.now() - new Date(game.startTime)
                }
            );
            console.log(' Game closed:', gameId);
            return game;
        } catch (error) {
            console.error(' Failed to close game:', error);
            return null;
        }
    }

    async disconnect() {
        try {
            await mongoose.connection.close();
            this.connected = false;
            console.log(' MongoDB disconnected');
        } catch (error) {
            console.error(' Failed to disconnect from MongoDB:', error);
        }
    }
}

module.exports = {
    GameDatabase,
    Game,
    Round,
    Viewer,
    Message
};

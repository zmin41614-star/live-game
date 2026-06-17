// Local Database Integration
const Database = {
    saveGameSession() {
        const sessionData = {
            tiktokUsername: TikTokAPI.username,
            startTime: new Date(),
            totalMessages: gameState.totalMessages,
            votes: gameState.votes
        };
        localStorage.setItem('last_game_session', JSON.stringify(sessionData));
        console.log('Game session data saved locally');
    }
};

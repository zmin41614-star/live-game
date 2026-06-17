js
// Game State Management
const gameState = {
    isConnected: false,
    currentQuestion: 'What\'s your favorite color?',
    options: ['Red', 'Blue', 'Yellow', 'Green'],
    votes: [0, 0, 0, 0],
    timeRemaining: 30,
    totalMessages: 0,
    viewerCount: 0,
    roundActive: false,
    chatMessages: []
};

// Initialize Game
function initGame() {
    console.log('Game initialized');
    updateUI();
}

// Start Connection
function startConnection() {
    const username = document.getElementById('username').value;
    const gameMode = document.getElementById('gameMode').value;

    if (!username) {
        alert('Please enter your TikTok username');
        return;
    }

    gameState.isConnected = true;
    gameState.roundActive = true;

    // Update UI
    document.getElementById('setupPanel').classList.add('hidden');
    document.getElementById('votingGame').classList.remove('hidden');
    updateConnectionStatus(true);
    addChatMessage('System', `Game started in ${gameMode} mode!`);
    startTimer();
}

// Vote Handler
function vote(optionIndex) {
    if (!gameState.roundActive) return;

    gameState.votes[optionIndex - 1]++;
    updateVoteDisplay();
    addChatMessage('You', `Voted for ${gameState.options[optionIndex - 1]}`);
}

// Update Vote Display
function updateVoteDisplay() {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`votes${i + 1}`).textContent = gameState.votes[i];
    }
}

// Timer
let timerInterval;
function startTimer() {
    gameState.timeRemaining = 30;
    timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        document.getElementById('timer').textContent = `Time: ${gameState.timeRemaining}s`;

        if (gameState.timeRemaining <= 0) {
            clearInterval(timerInterval);
            endRound();
        }
    }, 1000);
}

// End Round
function endRound() {
    gameState.roundActive = false;
    clearInterval(timerInterval);
    showResults();
}

// Show Results
function showResults() {
    document.getElementById('votingGame').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');

    const totalVotes = gameState.votes.reduce((a, b) => a + b, 0);
    const maxVotes = Math.max(...gameState.votes);
    const winnerIndex = gameState.votes.indexOf(maxVotes);

    let resultsHTML = '';
    gameState.votes.forEach((votes, index) => {
        const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
        resultsHTML += `
            <div class="result-item">
                <div class="result-label">
                    <span>${gameState.options[index]}</span>
                    <span>${votes} votes (${percentage}%)</span>
                </div>
                <div class="result-bar">
                    <div class="result-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });

    document.getElementById('resultsChart').innerHTML = resultsHTML;
    document.getElementById('winnerText').textContent = ` ${gameState.options[winnerIndex]} wins with ${maxVotes} votes!`;
}

// Start New Round
function startNewRound() {
    gameState.votes = [0, 0, 0, 0];
    gameState.roundActive = true;
    updateVoteDisplay();
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('votingGame').classList.remove('hidden');
    startTimer();
}

// Reset Votes
function resetVotes() {
    gameState.votes = [0, 0, 0, 0];
    updateVoteDisplay();
    addChatMessage('System', 'Votes have been reset');
}

// Stop Game
function stopGame() {
    if (confirm('Are you sure you want to stop the game?')) {
        gameState.isConnected = false;
        gameState.roundActive = false;
        clearInterval(timerInterval);
        document.getElementById('setupPanel').classList.remove('hidden');
        document.getElementById('votingGame').classList.add('hidden');
        document.getElementById('resultsScreen').classList.add('hidden');
        updateConnectionStatus(false);
        gameState.chatMessages = [];
        document.getElementById('chatMessages').innerHTML = '<div class="message"><strong>System:</strong> Waiting for viewers...</div>';
    }
}

// Add Chat Message
function addChatMessage(username, message) {
    gameState.chatMessages.push({ username, message });
    gameState.totalMessages++;
    updateChatDisplay();
    document.getElementById('messageCount').textContent = gameState.totalMessages;
}

// Update Chat Display
function updateChatDisplay() {
    const chatContainer = document.getElementById('chatMessages');
    const lastMessages = gameState.chatMessages.slice(-5);
    
    chatContainer.innerHTML = lastMessages.map(msg => 
        `<div class="message"><strong>${msg.username}:</strong> ${msg.message}</div>`
    ).join('');
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Update Connection Status
function updateConnectionStatus(connected) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('statusText');
    
    if (connected) {
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.classList.add('offline');
        statusIndicator.classList.remove('online');
        statusText.textContent = 'Disconnected';
    }
}

// Update UI
function updateUI() {
    updateVoteDisplay();
    document.getElementById('viewerCount').textContent = gameState.viewerCount;
    document.getElementById('messageCount').textContent = gameState.totalMessages;
}

// Initialize on page load
window.addEventListener('DOMContentLoade

// Game State Management
const gameState = {
    isConnected: false,
    currentQuestion: 'What\'s your favorite color?',
    options: ['Red', 'Blue', 'Yellow', 'Green'],
    votes:,
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
async function startConnection() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) { alert('Username ထည့်ပေးပါဦး ချစ်ဆုံး!'); return; }
    
    document.getElementById('statusBadge').innerText = ' Connecting...';
    document.getElementById('statusBadge').style.background = '#feca57';

    // TikTokAPI စနစ်အစစ်ဆီသို့ လှမ်းနှိုးခြင်း
    const success = await TikTokAPI.init(username);
    if (success) {
        // WebSocket Client မှတစ်ဆင့် ကိုယ်ပိုင်ဆာဗာသို့ ချိတ်ဆက်ခြင်း
        GameWSClient.connect();
    }
}

function updateUI() {
    if (gameState.isConnected) {
        document.getElementById('statusBadge').innerText = ' Connected';
        document.getElementById('statusBadge').className = 'status-badge connected';
        document.getElementById('setupArea').style.display = 'none';
        document.getElementById('voteResults').style.display = 'block';
    }
}

function renderVotes() {
    const totalVotes = gameState.votes.reduce((a, b) => a + b, 0);
    const colors = ['red', 'blue', 'yellow', 'green'];
    
    colors.forEach((color, index) => {
        const count = gameState.votes[index];
        document.getElementById(`${color}Count`).innerText = `${count} မဲ`;
        const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        document.getElementById(`${color}Bar`).style.width = `${percent}%`;
    });
}

window.onload = initGame;

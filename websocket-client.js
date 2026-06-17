// WebSocket Client for Real-time Communication
const GameWSClient = {
    // ချစ်ဆုံးမြှင့်တင်ထားသော မြန်နှုန်းမြင့် ဆာဗာလင့်ခ်သစ်သို့ တိုက်ရိုက်ချိတ်ခြင်း
    url: "https://onrender.com",
    socket: null,

    connect() {
        try {
            this.socket = io(this.url, { transports: ['websocket'] });

            this.socket.on('connect', () => {
                console.log(' WebSocket connected');
                // ဆာဗာဆီသို့ TikTok username လှမ်းပို့ပြီး လိုက်ဗ်အစစ်နှိုးခိုင်းခြင်း
                this.socket.emit('join-live', TikTokAPI.username);
            });

            this.socket.on('connect-status', (res) => {
                if (res.success) {
                    gameState.isConnected = true;
                    updateUI();
                }
            });

            // တကယ့်ပရိသတ်မဲပေးသံ (Chat/Comment) များ ဝင်လာလျှင် ဖတ်ခြင်း
            this.socket.on('tiktok-action', (data) => {
                if (data.type === 'chat') {
                    const text = data.text.toLowerCase().trim();
                    gameState.totalMessages += 1;
                    
                    if (text === 'red') gameState.votes[0] += 1;
                    if (text === 'blue') gameState.votes[1] += 1;
                    if (text === 'yellow') gameState.votes[2] += 1;
                    if (text === 'green') gameState.votes[3] += 1;
                    
                    renderVotes();
                }
            });
        } catch (e) {
            console.error('Connection error:', e);
        }
    }
};

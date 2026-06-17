// WebSocket Client for Real-time Communication

class GameWebSocketClient {
    constructor(url = 'ws://localhost:3000') {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = {};
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log(' WebSocket connected');
                    this.reconnectAttempts = 0;
                    this.emit('connected', { timestamp: new Date() });
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error(' WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log(' WebSocket disconnected');
                    this.emit('disconnected', { timestamp: new Date() });
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        const { type } = data;
        console.log(` Received: ${type}`, data);

        switch (type) {
            case 'init':
                this.emit('init', data);
                break;
            case 'chat':
                this.emit('chat', data);
                break;
            case 'vote':
                this.emit('vote', data);
                break;
            case 'gameStart':
                this.emit('gameStart', data);
                break;
            case 'gameEnd':
                this.emit('gameEnd', data);
                break;
            case 'roundEnd':
                this.emit('roundEnd', data);
                break;
            default:
                this.emit('message', data);
        }
    }

    send(type, data = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = { type, ...data, timestamp: new Date().toISOString() };
            this.ws.send(JSON.stringify(payload));
            console.log(` Sent: ${type}`);
        } else {
            console.warn(' WebSocket not connected. Message not sent.');
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(` Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect().catch(() => {}), this.reconnectDelay);
        } else {
            console.error(' Max reconnection attempts reached');
            this.emit('reconnectFailed', { attempts: this.reconnectAttempts });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Create global WebSocket instance
const wsClient = new GameWebSocketClient(
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
);

// Initialize WebSocket when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        wsClient.connect().catch(console.error);
    });
} else {
    wsClient.connect().catch(console.error);
              }

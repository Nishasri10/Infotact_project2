// WebSocket Service
let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const WebSocketService = {
    connect: () => {
        try {
            socket = new WebSocket('ws://localhost:5000');
            
            socket.onopen = () => {
                console.log('🔌 WebSocket connected');
                reconnectAttempts = 0;
                if (window.onWebSocketConnect) window.onWebSocketConnect();
            };
            
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('📨 WebSocket message:', data);
                if (window.onWebSocketMessage) window.onWebSocketMessage(data);
            };
            
            socket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                WebSocketService.reconnect();
            };
            
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    },
    
    reconnect: () => {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
                console.log(`🔄 Reconnecting WebSocket... Attempt ${reconnectAttempts}`);
                WebSocketService.connect();
            }, 3000);
        }
    },
    
    joinOrder: (orderId) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'join-order', orderId }));
        }
    },
    
    send: (data) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        }
    },
    
    disconnect: () => {
        if (socket) {
            socket.close();
        }
    }
};
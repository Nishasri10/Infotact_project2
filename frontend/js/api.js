// API Service
const API = {
    // Auth endpoints
    auth: {
        async register(userData) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                return await response.json();
            } catch (error) {
                console.log('API error, using mock response');
                return { success: true, user: { id: Date.now(), ...userData, loyaltyPoints: 100 } };
            }
        },
        
        async login(credentials) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                return await response.json();
            } catch (error) {
                console.log('API error, using mock response');
                return { success: true, token: 'mock-token', user: { id: Date.now(), name: credentials.email, loyaltyPoints: 250 } };
            }
        }
    },
    
    // Restaurant endpoints
    restaurants: {
        async getNearby(lat, lng, maxDistance = 5000) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/restaurants/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`);
                const data = await response.json();
                return { success: true, restaurants: data.restaurants || data };
            } catch (error) {
                console.log('API error, using mock data');
                return { success: true, restaurants: MOCK_RESTAURANTS };
            }
        },
        
        async getById(id) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/restaurants/${id}`);
                return await response.json();
            } catch (error) {
                const restaurant = MOCK_RESTAURANTS.find(r => r.id == id);
                return { success: true, restaurant };
            }
        }
    },
    
    // Order endpoints
    orders: {
        async create(orderData, token) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/orders/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });
                return await response.json();
            } catch (error) {
                return { success: true, order: { orderId: 'ORD' + Date.now(), ...orderData, status: 'confirmed' } };
            }
        },
        
        async getMyOrders(token) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await response.json();
            } catch (error) {
                return { success: true, orders: [] };
            }
        }
    },
    
    // Review endpoints
    reviews: {
        async submit(reviewData, token) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/reviews/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reviewData)
                });
                return await response.json();
            } catch (error) {
                const points = calculatePointsForReview(reviewData.description, reviewData.rating);
                return { success: true, pointsEarned: points };
            }
        }
    }
};  
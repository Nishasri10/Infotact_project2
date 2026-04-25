// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#2E7D32' : '#D32F2F';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatPrice(price) {
    return `₹${price}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function getLevel(points) {
    const level = Math.floor(points / 500) + 1;
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return levels[Math.min(level - 1, levels.length - 1)];
}

function calculatePointsForReview(description, rating) {
    let points = 10;
    if (description.length >= 100) points += 20;
    else if (description.length >= 50) points += 10;
    if (rating >= 4) points += 10;
    if (rating === 5) points += 5;
    return Math.min(points, 50);
}
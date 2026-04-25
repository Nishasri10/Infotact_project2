// Review Modal Component
let currentOrderForReview = null;

function ReviewModal() {
    return `
        <div class="modal" id="reviewModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Write a Review</h3>
                    <button class="modal-close" onclick="closeReviewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reviewForm">
                        <div class="form-group">
                            <label>Your Rating</label>
                            <div class="star-rating" id="starRating">
                                <span class="star" data-rating="1">☆</span>
                                <span class="star" data-rating="2">☆</span>
                                <span class="star" data-rating="3">☆</span>
                                <span class="star" data-rating="4">☆</span>
                                <span class="star" data-rating="5">☆</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Review Title</label>
                            <input type="text" class="form-input" id="reviewTitle" placeholder="Summarize your experience" required>
                        </div>
                        <div class="form-group">
                            <label>Your Review</label>
                            <textarea class="form-textarea" id="reviewDescription" placeholder="Share your experience... (Minimum 50 characters for bonus points!)" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Tags (optional)</label>
                            <input type="text" class="form-input" id="reviewTags" placeholder="Good Service, Great Food, etc.">
                        </div>
                        <button type="submit" class="btn-primary">Submit Review & Earn Points</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function openReviewModal(order) {
    currentOrderForReview = order;
    document.getElementById('reviewModal').classList.add('active');
    
    // Setup star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.onclick = () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        };
    });
    
    // Setup form submission
    const form = document.getElementById('reviewForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const rating = document.querySelectorAll('.star.active').length;
        const title = document.getElementById('reviewTitle').value;
        const description = document.getElementById('reviewDescription').value;
        const tags = document.getElementById('reviewTags').value.split(',').map(t => t.trim());
        
        if (rating === 0) {
            showNotification('Please select a rating', 'warning');
            return;
        }
        
        if (description.length < 10) {
            showNotification('Please write a longer review', 'warning');
            return;
        }
        
        const reviewData = {
            restaurantId: currentOrderForReview.restaurantId,
            orderId: currentOrderForReview._id,
            rating,
            title,
            description,
            tags
        };
        
        const result = await API.reviews.submit(reviewData, window.currentUser.token);
        
        if (result.success) {
            showNotification(`✨ Review submitted! You earned ${result.pointsEarned} points!`);
            closeReviewModal();
            if (window.refreshDashboard) window.refreshDashboard();
        } else {
            showNotification(result.error || 'Failed to submit review', 'error');
        }
    };
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
    document.getElementById('reviewForm').reset();
    document.querySelectorAll('.star').forEach(s => {
        s.classList.remove('active');
        s.textContent = '☆';
    });
}
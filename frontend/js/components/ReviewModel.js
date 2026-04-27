let currentOrderForReview = null;
let currentRating = 0;

function ReviewModal() {
    return `
        <div class="modal" id="reviewModal">
            <div class="modal-content">
                <div class="modal-header"><h3><i class="fas fa-star"></i> Write a Review</h3><button class="modal-close" onclick="closeReviewModal()">&times;</button></div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Your Rating</label>
                        <div class="star-rating" id="starRating" style="display: flex; gap: 0.5rem; font-size: 2rem; cursor: pointer;">
                            <span class="star" data-rating="1" onclick="setRating(1)">☆</span>
                            <span class="star" data-rating="2" onclick="setRating(2)">☆</span>
                            <span class="star" data-rating="3" onclick="setRating(3)">☆</span>
                            <span class="star" data-rating="4" onclick="setRating(4)">☆</span>
                            <span class="star" data-rating="5" onclick="setRating(5)">☆</span>
                        </div>
                    </div>
                    <div class="form-group"><label>Review Title</label><input type="text" class="form-input" id="reviewTitle" placeholder="Summarize your experience"></div>
                    <div class="form-group"><label>Your Review</label><textarea class="form-textarea" id="reviewDescription" rows="4" placeholder="Share your experience... (Minimum 50 characters for bonus points!)"></textarea></div>
                    <button class="btn-primary" onclick="submitReview()"><i class="fas fa-paper-plane"></i> Submit Review & Earn Points</button>
                </div>
            </div>
        </div>
    `;
}

function setRating(rating) {
    currentRating = rating;
    document.querySelectorAll('.star').forEach((star, idx) => {
        if (idx < rating) { star.textContent = '★'; star.classList.add('active'); }
        else { star.textContent = '☆'; star.classList.remove('active'); }
    });
}

function openReviewModal(order) { currentOrderForReview = order; currentRating = 0; document.getElementById('reviewModal').classList.add('active'); setRating(0); }
function closeReviewModal() { document.getElementById('reviewModal').classList.remove('active'); }

function submitReview() {
    if (currentRating === 0) { showNotification('Please select a rating', 'warning'); return; }
    const title = document.getElementById('reviewTitle').value;
    const description = document.getElementById('reviewDescription').value;
    if (description.length < 10) { showNotification('Please write a longer review', 'warning'); return; }
    showNotification('✨ Review submitted! You earned 25 points!');
    closeReviewModal();
}
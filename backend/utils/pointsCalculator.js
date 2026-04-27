class PointsCalculator {
  static calculateReviewPoints(review) {
    let points = 10; // Base points
    
    // Length bonus
    if (review.description.length >= 200) points += 30;
    else if (review.description.length >= 100) points += 20;
    else if (review.description.length >= 50) points += 10;
    
    // Rating bonus
    if (review.rating >= 4) points += 10;
    if (review.rating === 5) points += 5;
    
    // Title quality
    if (review.title && review.title.length >= 15) points += 5;
    if (review.title && review.title.length >= 30) points += 5;
    
    // Media bonus (max 3 images)
    if (review.images && review.images.length > 0) {
      points += Math.min(review.images.length * 5, 15);
    }
    
    // Keyword density bonus (AI-assisted)
    const keywords = [
      'delicious', 'amazing', 'great', 'recommend', 'fresh', 
      'quality', 'service', 'excellent', 'wonderful', 'fantastic',
      'best', 'love', 'perfect', 'awesome', 'incredible'
    ];
    const keywordCount = keywords.filter(kw => 
      review.description.toLowerCase().includes(kw)
    ).length;
    points += Math.min(keywordCount * 3, 15);
    
    // Verified purchase bonus
    if (review.isVerified) points += 20;
    
    // Contains specific dish mentions
    const dishKeywords = ['chicken', 'pizza', 'burger', 'sushi', 'pasta', 'biryani', 'curry'];
    const dishMentions = dishKeywords.filter(kw => 
      review.description.toLowerCase().includes(kw)
    ).length;
    points += Math.min(dishMentions * 5, 10);
    
    return Math.min(points, 100); // Cap at 100 points
  }
  
  static calculateOrderPoints(orderTotal) {
    return Math.floor(orderTotal / 20);
  }
  
  static getLevel(points) {
    if (points >= 10000) return { level: 'Diamond', badge: '💎', multiplier: 2.0, color: '#b9f2ff' };
    if (points >= 5000) return { level: 'Platinum', badge: '⭐', multiplier: 1.75, color: '#e5e4e2' };
    if (points >= 2000) return { level: 'Gold', badge: '🏆', multiplier: 1.5, color: '#ffd700' };
    if (points >= 1000) return { level: 'Silver', badge: '🥈', multiplier: 1.25, color: '#c0c0c0' };
    if (points >= 500) return { level: 'Bronze', badge: '🥉', multiplier: 1.1, color: '#cd7f32' };
    return { level: 'Member', badge: '👤', multiplier: 1.0, color: '#6c757d' };
  }
  
  static getNextLevelPoints(points) {
    if (points < 500) return 500 - points;
    if (points < 1000) return 1000 - points;
    if (points < 2000) return 2000 - points;
    if (points < 5000) return 5000 - points;
    if (points < 10000) return 10000 - points;
    return 0;
  }
  
  static calculateDiscount(points, totalAmount) {
    const level = this.getLevel(points);
    const maxDiscount = Math.min(totalAmount * 0.2, points * 0.5);
    return Math.floor(maxDiscount * level.multiplier);
  }
}

module.exports = PointsCalculator;
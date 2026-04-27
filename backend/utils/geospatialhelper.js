class GeospatialHelper {
  // Calculate distance between two points using Haversine formula
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  static toRad(degrees) {
    return degrees * Math.PI / 180;
  }
  
  // Validate GeoJSON point
  static isValidGeoPoint(coordinates) {
    return Array.isArray(coordinates) &&
           coordinates.length === 2 &&
           typeof coordinates[0] === 'number' &&
           typeof coordinates[1] === 'number' &&
           coordinates[0] >= -180 && coordinates[0] <= 180 &&
           coordinates[1] >= -90 && coordinates[1] <= 90;
  }
  
  // Create MongoDB GeoJSON point
  static createGeoPoint(lng, lat) {
    return {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };
  }
  
  // Calculate delivery fee based on distance
  static calculateDeliveryFee(distance, baseFee = 40, perKmFee = 10) {
    if (distance <= 2) return baseFee;
    return baseFee + Math.ceil((distance - 2) * perKmFee);
  }
  
  // Estimate delivery time based on distance and preparation time
  static estimateDeliveryTime(distance, prepTime = 20) {
    const travelTime = distance * 2; // 2 minutes per km
    return Math.ceil(prepTime + travelTime);
  }
}

module.exports = GeospatialHelper;
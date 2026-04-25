const Restaurant = require('../models/Restaurant');

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000, cuisine, minRating, page = 1, limit = 20 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Please provide latitude and longitude' });
    }
    
    const query = {};
    if (cuisine) query.cuisine = { $in: [cuisine] };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    query.isDeliveryActive = true;
    
    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: query
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $divide: [
              { $multiply: ['$rating', 1.5] },
              { $add: [{ $divide: ['$distance', 1000] }, 1] }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1, rating: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);
    
    const total = await Restaurant.countDocuments(query);
    
    res.json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      restaurants
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    
    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Search restaurants
// @route   GET /api/restaurants/search
// @access  Public
exports.searchRestaurants = async (req, res) => {
  try {
    const { q, lat, lng, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Please provide search query' });
    }
    
    let restaurants = [];
    
    if (lat && lng) {
      // Search with location
      restaurants = await Restaurant.aggregate([
        {
          $match: {
            $text: { $search: q }
          }
        },
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            spherical: true
          }
        },
        { $limit: parseInt(limit) }
      ]);
    } else {
      // Search without location
      restaurants = await Restaurant.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));
    }
    
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('menu name');
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    
    // Group menu by category
    const menuByCategory = restaurant.menu.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      restaurantName: restaurant.name,
      menu: menuByCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update restaurant status (Owner only)
// @route   PUT /api/restaurants/:id/status
// @access  Private (Restaurant Owner)
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { isDeliveryActive, isDineInActive, isOpen } = req.body;
    
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found or unauthorized' });
    }
    
    if (isDeliveryActive !== undefined) restaurant.isDeliveryActive = isDeliveryActive;
    if (isDineInActive !== undefined) restaurant.isDineInActive = isDineInActive;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;
    
    await restaurant.save();
    
    res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        isDeliveryActive: restaurant.isDeliveryActive,
        isDineInActive: restaurant.isDineInActive,
        isOpen: restaurant.isOpen
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update menu item (Owner only)
// @route   PUT /api/restaurants/:id/menu/:itemId
// @access  Private (Restaurant Owner)
exports.updateMenuItem = async (req, res) => {
  try {
    const { isAvailable, price, name, description } = req.body;
    
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found or unauthorized' });
    }
    
    const menuItem = restaurant.menu.id(req.params.itemId);
    
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (price !== undefined) menuItem.price = price;
    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    
    await restaurant.save();
    
    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
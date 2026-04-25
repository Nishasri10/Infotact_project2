const Event = require('../models/Event');
const Restaurant = require('../models/Restaurant');

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000, type, page = 1, limit = 20 } = req.query;
    
    let query = {
      date: { $gte: new Date() },
      isActive: true,
      availableSeats: { $gt: 0 }
    };
    
    if (type) query.type = type;
    
    let events = [];
    
    if (lat && lng) {
      // First get nearby restaurants
      const nearbyRestaurants = await Restaurant.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            maxDistance: parseInt(maxDistance),
            spherical: true
          }
        },
        { $project: { _id: 1, distance: 1 } }
      ]);
      
      const restaurantIds = nearbyRestaurants.map(r => r._id);
      query.restaurantId = { $in: restaurantIds };
      
      events = await Event.find(query)
        .populate('restaurantId', 'name address coverImage location')
        .sort({ date: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
      
      // Add distance to each event
      events = events.map(event => {
        const restaurant = nearbyRestaurants.find(r => r._id.equals(event.restaurantId._id));
        return {
          ...event.toObject(),
          distance: restaurant ? restaurant.distance : null
        };
      });
    } else {
      events = await Event.find(query)
        .populate('restaurantId', 'name address coverImage location')
        .sort({ date: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }
    
    const total = await Event.countDocuments(query);
    
    res.json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      events
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('restaurantId', 'name address contactNumber email coverImage');
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Book event tickets
// @route   POST /api/events/:id/book
// @access  Private
exports.bookEvent = async (req, res) => {
  try {
    const { tickets, specialRequests } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    if (event.availableSeats < tickets) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
    }
    
    // Check if user already booked
    const alreadyBooked = event.attendees.some(a => a.userId.toString() === req.user.id);
    if (alreadyBooked) {
      return res.status(400).json({ success: false, error: 'Already booked this event' });
    }
    
    event.availableSeats -= tickets;
    event.attendees.push({
      userId: req.user.id,
      ticketCount: tickets,
      bookingDate: new Date(),
      specialRequests
    });
    
    await event.save();
    
    res.json({
      success: true,
      message: `Successfully booked ${tickets} ticket(s) for ${event.name}`,
      booking: {
        eventId: event._id,
        eventName: event.name,
        tickets,
        totalPrice: tickets * (event.discountedPrice || event.price)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
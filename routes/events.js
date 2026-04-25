const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      isActive: true,
      availableSeats: { $gt: 0 }
    })
    .populate('restaurantId', 'name address coverImage')
    .sort({ date: 1 })
    .limit(20);
    
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('restaurantId', 'name address contactNumber email');
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Book event tickets
router.post('/:id/book', protect, async (req, res) => {
  try {
    const { tickets, specialRequests } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    if (event.availableSeats < tickets) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
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
      message: `Successfully booked ${tickets} ticket(s)`,
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
});

module.exports = router;
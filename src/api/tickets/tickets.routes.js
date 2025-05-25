const express = require('express');
const router = express.Router();
const ticketsService = require('./tickets.service');

// Alle Tickets eines Events abrufen
router.get('/event/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    const tickets = await ticketsService.getTicketsByEvent(eventId);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
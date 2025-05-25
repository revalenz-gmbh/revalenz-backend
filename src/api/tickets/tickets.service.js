const pool = require('../../db');

async function getTicketsByEvent(eventId) {
  const result = await pool.query('SELECT * FROM tickets WHERE event_id = $1', [eventId]);
  return result.rows;
}

module.exports = { getTicketsByEvent }; 
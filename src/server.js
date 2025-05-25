require('dotenv').config();
const express = require('express');
const cors = require('cors');

const ticketsRouter = require('./api/tickets/tickets.routes');
const authRoutes = require('./api/auth');
const tenantsRoutes = require('./api/tenants');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketsRouter);
app.use('/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
}); 
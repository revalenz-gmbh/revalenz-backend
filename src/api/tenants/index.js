const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name der Organisation fehlt' });
  }
  try {
    // Prüfen, ob es die Organisation schon gibt
    let tenant = await prisma.tenants.findUnique({ where: { name } });
    if (!tenant) {
      tenant = await prisma.tenants.create({ data: { name } });
    }
    res.json({ id: tenant.id });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Anlegen der Organisation' });
  }
});

module.exports = router;
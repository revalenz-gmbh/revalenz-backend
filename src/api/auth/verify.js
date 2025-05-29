const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) return res.status(400).send('Ungültiger oder abgelaufener Token');
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'active', verificationToken: null }
    });
    res.send('E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  }
});

module.exports = router;
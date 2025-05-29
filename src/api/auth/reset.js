const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || user.resetTokenExpiry < new Date()) return res.status(400).send('Token ungültig oder abgelaufen');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });
    res.send('Passwort erfolgreich geändert!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  }
});

module.exports = router;
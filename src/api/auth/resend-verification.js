const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendMail, generateToken } = require('../../utils/emailService');
const prisma = new PrismaClient();
const router = express.Router();

// POST /auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status === 'active') {
      return res.status(400).json({ error: 'E-Mail nicht gefunden oder bereits bestätigt.' });
    }
    const verificationToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken }
    });
    const verificationUrl = `https://deine-domain.de/auth/verify?token=${verificationToken}`;
    // await sendMail({
    //   to: email,
    //   subject: 'Bitte bestätige deine E-Mail-Adresse erneut',
    //   text: `Hallo,\n\nbitte bestätige deine E-Mail-Adresse erneut, indem du auf diesen Link klickst:\n${verificationUrl}\n\nViele Grüße,\nDein Revalenz-Team`
    // });
    res.json({ message: 'Verifizierungs-E-Mail wurde erneut gesendet.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim erneuten Senden der Verifizierungs-E-Mail.' });
  }
});

module.exports = router; 
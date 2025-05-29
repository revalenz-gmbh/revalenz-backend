const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { sendMail, generateToken } = require('../../utils/emailService');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, tenant_id, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-Mail bereits registriert' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tenant_id,
        role: role || 'customer',
        status: 'pending',
        verificationToken
      }
    });

    // Bestätigungs-E-Mail senden
    const verificationUrl = `https://deine-domain.de/auth/verify?token=${verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      text: `Hallo,\n\nbitte bestätige deine E-Mail-Adresse, indem du auf diesen Link klickst:\n${verificationUrl}\n\nViele Grüße,\nDein Revalenz-Team`
    });

    res.status(201).json({ message: 'Registrierung erfolgreich! Bitte E-Mail bestätigen.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;
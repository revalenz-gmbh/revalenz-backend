const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendMail, generateToken } = require('../../utils/emailService');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Falls die E-Mail existiert, wurde eine Nachricht verschickt.' });

    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const resetUrl = `https://deine-domain.de/auth/reset?token=${resetToken}`;
    await sendMail({
      to: email,
      subject: 'Passwort zurücksetzen',
      text: `Hallo,\n\num dein Passwort zurückzusetzen, klicke auf diesen Link:\n${resetUrl}\n\nDer Link ist 1 Stunde gültig.\n\nViele Grüße,\nDein Revalenz-Team`
    });

    res.status(200).json({ message: 'Falls die E-Mail existiert, wurde eine Nachricht verschickt.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;
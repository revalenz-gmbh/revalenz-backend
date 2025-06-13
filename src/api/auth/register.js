const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../../db/prisma');
const { sendMail, generateToken } = require('../../utils/emailService');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, organization, role } = req.body;
  
  try {
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'E-Mail, Passwort und Name sind erforderlich'
      });
    }

    // Prüfe ob User bereits existiert
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'email_exists',
        message: 'Diese E-Mail-Adresse ist bereits registriert.' 
      });
    }

    // Tenant/Organization handling
    let tenant_id = 1; // Default
    if (organization) {
      // Versuche Organization zu finden oder erstelle sie
      let tenant = await prisma.tenants.findUnique({ where: { name: organization } });
      if (!tenant) {
        tenant = await prisma.tenants.create({ data: { name: organization } });
      }
      tenant_id = tenant.id;
    }

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
    const verificationUrl = `https://revalenz-backend-920300921634.europe-west1.run.app/auth/verify?token=${verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      text: `Hallo ${name},\n\nbitte bestätige deine E-Mail-Adresse, indem du auf diesen Link klickst:\n${verificationUrl}\n\nViele Grüße,\nDein Revalenz-Team`
    });

    // Frontend-kompatible Response
    res.status(201).json({ 
      success: true,
      verificationToken: verificationToken,
      message: 'Registrierung erfolgreich! Bitte E-Mail bestätigen.' 
    });
    
  } catch (err) {
    console.error('Registrierungs-Fehler:', err);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Serverfehler bei der Registrierung' 
    });
  }
});

module.exports = router;
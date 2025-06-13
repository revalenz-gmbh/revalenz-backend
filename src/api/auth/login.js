const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'deinGeheimerJWTKey';
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // User suchen
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'invalid_credentials',
        message: 'Ungültige E-Mail oder Passwort' 
      });
    }

    // Status prüfen
    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'email_not_verified',
        message: 'E-Mail nicht verifiziert. Bitte prüfen Sie Ihr E-Mail-Postfach.' 
      });
    }

    // Passwort prüfen
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'invalid_credentials',
        message: 'Ungültige E-Mail oder Passwort' 
      });
    }

    // JWT-Token erstellen
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Frontend-kompatible Response
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login-Fehler:', err);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Serverfehler beim Login' 
    });
  }
});

module.exports = router;
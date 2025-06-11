const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  
  console.log('Verify-Request erhalten:', { token: token ? 'vorhanden' : 'fehlt' });
  
  if (!token) {
    return res.status(400).send('Token fehlt');
  }
  
  try {
    console.log('Suche User mit Token...');
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    
    if (!user) {
      console.log('User mit Token nicht gefunden');
      return res.status(400).send('Ungültiger oder abgelaufener Token');
    }
    
    console.log('User gefunden, aktualisiere Status...', { userId: user.id, email: user.email });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'active', verificationToken: null }
    });
    
    console.log('User erfolgreich aktiviert!');
    res.send('E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.');
    
  } catch (err) {
    console.error('Verify-Fehler:', err);
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    res.status(500).send(`Serverfehler: ${err.message}`);
  }
});

module.exports = router;
const express = require('express');
const { sendMail, generateToken } = require('../../utils/emailService');
const router = express.Router();

// POST /api/email/verification
router.post('/verification', async (req, res) => {
  const { email, name, verification_link, type } = req.body;
  
  try {
    console.log('E-Mail-Verification Request:', { email, name, type });
    
    if (!email || !name) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'E-Mail und Name sind erforderlich'
      });
    }

    const subject = 'Bitte bestätige deine E-Mail-Adresse';
    const text = `Hallo ${name},\n\nbitte bestätige deine E-Mail-Adresse, indem du auf diesen Link klickst:\n${verification_link}\n\nViele Grüße,\nDein Revalenz-Team`;

    await sendMail({
      to: email,
      subject: subject,
      text: text
    });

    console.log('Verification-E-Mail erfolgreich versendet an:', email);
    
    res.json({
      success: true,
      message: 'Verification-E-Mail versendet'
    });

  } catch (error) {
    console.error('E-Mail-Versand-Fehler:', error);
    res.status(500).json({
      error: 'email_failed',
      message: 'E-Mail konnte nicht versendet werden',
      details: error.message
    });
  }
});

// POST /api/email/welcome
router.post('/welcome', async (req, res) => {
  const { email, name, type } = req.body;
  
  try {
    console.log('Welcome-E-Mail Request:', { email, name, type });
    
    await sendMail({
      to: email,
      subject: 'Willkommen bei Revalenz!',
      text: `Hallo ${name},\n\nwillkommen bei Revalenz! Ihr Account wurde erfolgreich erstellt.\n\nViele Grüße,\nIhr Revalenz-Team`
    });

    res.json({
      success: true,
      message: 'Welcome-E-Mail versendet'
    });

  } catch (error) {
    console.error('Welcome-E-Mail-Fehler:', error);
    res.status(500).json({
      error: 'email_failed',
      message: 'Welcome-E-Mail konnte nicht versendet werden'
    });
  }
});

module.exports = router; 
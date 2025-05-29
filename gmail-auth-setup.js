const { google } = require('googleapis');
const open = (...args) => import('open').then(m => m.default(...args));
const express = require('express');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

const REDIRECT_URI = 'http://localhost:4000/api/gmail/oauth2callback';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const app = express();

app.get('/api/gmail/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  res.send('Authentifizierung erfolgreich! Du kannst das Fenster schließen.');

  // Zeige das Refresh Token im Terminal an (nur beim ersten Mal!)
  console.log('Refresh Token:', tokens.refresh_token);
  process.exit(0);
});

app.listen(4000, async () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  console.log('Bitte öffne diesen Link im Browser und autorisiere die App:');
  console.log(authUrl);
  await open(authUrl);
});
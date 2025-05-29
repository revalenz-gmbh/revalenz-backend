const { google } = require('googleapis');
const crypto = require('crypto');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail({ to, subject, text }) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const rawMessage = [
    'From: "Revalenz Tickets" <noreply@revalenz.de>',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    text
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { sendMail, generateToken };
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function registerUser(req, res) {
  const { email, password, name, tenant_id, role } = req.body;

  // 1. Prüfen, ob User schon existiert
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'E-Mail bereits vergeben' });
  }

  // 2. Passwort hashen
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. User anlegen
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      tenant_id,
      role: role || 'customer', // Standardrolle, falls nicht angegeben
    },
  });

  // 4. Erfolgsmeldung zurückgeben
  res.status(201).json({ message: 'User angelegt', user: { id: user.id, email: user.email } });
}

module.exports = registerUser;
import { useState } from 'react';
import type { FC } from 'react';

type AuthMode = 'login' | 'register';

interface AuthDialogProps {
  organisation?: string;
  onLoginSuccess?: () => void;
}

const API_URL = 'http://localhost:3000/auth';

const AuthDialog: FC<AuthDialogProps> = ({ organisation, onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let tenant_id = 1; // Standardwert

    // Wenn Organisation angegeben, neuen Tenant anlegen
    if (mode === 'register' && organisation && organisation.trim() !== '') {
      try {
        const tenantResponse = await fetch('http://localhost:3000/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: organisation }),
        });
        const tenantData = await tenantResponse.json();
        if (tenantResponse.ok && tenantData.id) {
          tenant_id = tenantData.id;
        } else {
          setError('Fehler beim Anlegen der Organisation');
          return;
        }
      } catch (err) {
        setError('Fehler beim Anlegen der Organisation');
        return;
      }
    }

    const endpoint = mode === 'login' ? '/login' : '/register';
    const payload: any = { email, password };
    if (mode === 'register') {
      payload.name = name;
      payload.tenant_id = tenant_id;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'login') {
          localStorage.setItem('token', data.token);
          setSuccess('Login erfolgreich!');
          onLoginSuccess?.();
        } else {
          setSuccess('Registrierung erfolgreich! Du kannst dich jetzt einloggen.');
          setMode('login');
        }
      } else {
        setError(data.error || 'Fehler bei der Authentifizierung');
      }
    } catch (err) {
      setError('Serverfehler. Bitte versuche es später erneut.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' ? 'Login' : 'Registrieren'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail:
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort:
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm">{success}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {mode === 'login' ? 'Login' : 'Registrieren'}
        </button>
      </form>
      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <span>
            Noch kein Konto?{' '}
            <button
              onClick={() => setMode('register')}
              className="text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Registrieren
            </button>
          </span>
        ) : (
          <span>
            Bereits registriert?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Login
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthDialog; 
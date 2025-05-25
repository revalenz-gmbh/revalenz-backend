import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthDialog from '../components/AuthDialog';

// Beispiel-Ticket-Typ (passe ggf. an dein Backend an)
type Ticket = {
  id: number;
  ticket_code: string;
  event_id: number;
  // weitere Felder nach Bedarf
};

const TicketService = () => {
  const [organisation, setOrganisation] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string>('');

  // Tickets laden, wenn eingeloggt
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/api/tickets/meine-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setTickets(data.tickets || []);
          } else if (res.status === 401 || res.status === 403) {
            setError('Nicht eingeloggt oder keine Berechtigung.');
            setIsAuthenticated(false);
          } else {
            setError('Fehler beim Laden der Tickets.');
          }
        })
        .catch(() => setError('Serverfehler beim Laden der Tickets.'));
    }
  }, [isAuthenticated]);

  // Callback nach erfolgreichem Login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setError('');
    // Öffne Tickets in neuem Fenster
    window.open('/ticket-service/dashboard', '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center">Ticket Service</h1>
          <Link 
            to="/" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Zurück zur Hauptseite
          </Link>
        </div>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg mb-6 text-center">
            Willkommen im Revalenz Ticket Service. Bitte melden Sie sich an oder registrieren Sie sich, um fortzufahren.
          </p>
          <input
            type="text"
            placeholder="Organisation (optional)"
            value={organisation}
            onChange={e => setOrganisation(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          />
          <AuthDialog organisation={organisation} onLoginSuccess={handleLoginSuccess} />
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">Ticket Service</h1>
        <Link 
          to="/" 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Zurück zur Hauptseite
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Deine Tickets</h2>
        {error && <div className="text-red-600">{error}</div>}
        {tickets.length === 0 ? (
          <p>Keine Tickets gefunden.</p>
        ) : (
          <ul>
            {tickets.map(ticket => (
              <li key={ticket.id}>
                Ticket-Code: {ticket.ticket_code} (Event-ID: {ticket.event_id})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketService; 
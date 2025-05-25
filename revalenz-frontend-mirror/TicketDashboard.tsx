import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Ticket = {
  id: number;
  ticket_code: string;
  event_id: number;
};

const TicketDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/ticket-service';
      return;
    }

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
          window.location.href = '/ticket-service';
        } else {
          setError('Fehler beim Laden der Tickets.');
        }
      })
      .catch(() => setError('Serverfehler beim Laden der Tickets.'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/ticket-service';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ticket Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            Abmelden
          </button>
          <Link 
            to="/" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Zurück zur Hauptseite
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Deine Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-600">Keine Tickets gefunden.</p>
          ) : (
            <div className="grid gap-4">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Ticket #{ticket.ticket_code}</p>
                      <p className="text-sm text-gray-600">Event-ID: {ticket.event_id}</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard; 
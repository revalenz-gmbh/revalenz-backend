import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Calendar, MapPin, AlertCircle, CheckCircle, CalendarDays } from 'lucide-react';
import { NEXT_EVENT_DETAILS } from '../../config/eventConfig';
import { TICKET_TYPES } from '../../config/tickettypes';

interface TicketReservationWidgetProps {
    tenant_id: number;
    event_id: number;
    apiUrl?: string; // Optional, Standardwert ist die zentrale API
  }
  
  const DEFAULT_API_URL = 'https://api.revalenz.de/api/tickets/reservieren';
  
  const TicketReservationWidget: React.FC<TicketReservationWidgetProps> = ({ tenant_id, event_id, apiUrl }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [ticketType, setTicketType] = useState(TICKET_TYPES[0].id);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFeedback(null);
      setIsLoading(true);
  
      if (!name.trim() || !email.trim()) {
        setFeedback({ type: 'error', message: 'Bitte Name und E-Mail angeben.' });
        setIsLoading(false);
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setFeedback({ type: 'error', message: 'Bitte eine gültige E-Mail-Adresse angeben.' });
        setIsLoading(false);
        return;
      }
      if (quantity < 1) {
        setFeedback({ type: 'error', message: 'Bitte mindestens 1 Ticket auswählen.' });
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await fetch(apiUrl || DEFAULT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id,
            event_id,
            name,
            email,
            ticket_type: ticketType,
            anzahl: quantity,
          }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setFeedback({ type: 'success', message: data.message || 'Reservierung erfolgreich!' });
          setName('');
          setEmail('');
          setQuantity(1);
        } else {
          setFeedback({ type: 'error', message: data.error || 'Reservierung fehlgeschlagen.' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Serverfehler. Bitte später erneut versuchen.' });
      } finally {
        setIsLoading(false);
      }
    };
  
    const calculateTotal = () => {
      const selectedTicket = TICKET_TYPES.find(t => t.id === ticketType);
      return (selectedTicket?.price || 0) * quantity;
    };
  
    return (
      <Card className="w-full max-w-2xl mx-auto border-t-4 border-t-rotary-blue">
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-rotary-blue">
            Ticket Bestellung - {NEXT_EVENT_DETAILS.eventTitle}
          </CardTitle>
          <CardDescription className="space-y-4">
            <p className="flex items-center text-sm text-gray-500 mt-2">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              {NEXT_EVENT_DETAILS.fullLocation}
            </p>
            <p className="flex items-center text-sm text-gray-500">
              <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{NEXT_EVENT_DETAILS.formattedWeekdayDate} - {NEXT_EVENT_DETAILS.fullTimeInfo}</span>
            </p>
            <p className="mt-4 pt-4 text-sm text-gray-600">
              Ein unterhaltsamer Abend mit Quiz, Big Band Musik der "Golden Wings" und Show-Elementen.
              Der gesamte Erlös kommt regionalen gemeinnützigen Projekten zugute.
            </p>
          </CardDescription>
        </CardHeader>
  
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Ihr vollständiger Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFeedback(null); }}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Ihre E-Mail-Adresse"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFeedback(null); }}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="ticketType">Ticket-Typ</Label>
                <select
                  id="ticketType"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
                >
                  {TICKET_TYPES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.description} ({t.price.toFixed(2)} €)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="quantity">Anzahl</Label>
                <Input
                  type="number"
                  id="quantity"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
  
          <CardFooter className="flex flex-col items-stretch gap-4">
            {feedback && (
              <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                {feedback.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertTitle>{feedback.type === 'error' ? 'Fehler' : 'Erfolg'}</AlertTitle>
                <AlertDescription>
                  {feedback.message}
                </AlertDescription>
              </Alert>
            )}
  
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-medium">Gesamtbetrag:</span>
              <span className="text-xl font-bold text-rotary-blue">
                {calculateTotal().toFixed(2)} €
              </span>
            </div>
  
            <Button
              type="submit"
              disabled={isLoading || !name || !email || quantity < 1}
              className="w-full flex justify-center items-center px-6 py-3 rounded-md bg-rotary-blue text-white font-medium hover:bg-rotary-blue/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wird gesendet...' : 'Tickets bestellen'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
  
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-rotary-blue">
                100% des Erlöses geht an gemeinnützige Projekte
              </p>
              <p className="text-xs text-gray-500">
                Eine Veranstaltung der Rotary Clubs Dülmen und Lüdinghausen
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    );
  };
  
  export default TicketReservationWidget; 
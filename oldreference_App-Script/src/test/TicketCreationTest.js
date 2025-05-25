const TicketCreationService = require('../core/TicketCreationService');

async function testTicketCreation() {
  try {
    const result = await TicketCreationService.createTickets({
      licenseKey: 'DEMO-LICENSE-KEY-123',
      email: 'kunde@example.com',
      event: 'Sommerfest 2024',
      ticketType: 'VIP',
      quantity: 2,
      additionalData: {
        holder: 'Max Mustermann'
      }
    });
    console.log('Erstellte Tickets:', result);
  } catch (error) {
    console.error('Fehler bei der Ticketerstellung:', error.message);
  }
}

testTicketCreation(); 
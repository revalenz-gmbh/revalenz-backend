/**
 * TicketUtils.gs – Hilfsfunktionen für die Ticket-Erstellung und -Verarbeitung
 *
 * Dieses Modul kapselt die wichtigsten Funktionen zur Erstellung von Tickets
 * (Slides, QR-Code, Google Drive) für den mandantenfähigen Ticketservice.
 */

/**
 * Erstellt ein Ticket basierend auf einer Google Slides Vorlage.
 * @param {string} templateId - ID der Google Slides Vorlage
 * @param {Object} ticketData - Daten für das Ticket (id, name, type, date, etc.)
 * @param {string} targetFolderId - Zielordner für das erstellte Ticket
 * @return {Object} Informationen über das erstellte Ticket
 */
function createTicketFromSlides(templateId, ticketData, targetFolderId) {
  try {
    // Kopiere die Vorlage
    const template = DriveApp.getFileById(templateId);
    const targetFolder = DriveApp.getFolderById(targetFolderId);
    const ticketFile = template.makeCopy(ticketData.id, targetFolder);

    // Öffne die Kopie als Slides
    const ticketSlides = SlidesApp.openById(ticketFile.getId());

    // Ersetze Platzhalter in allen Folien
    const slides = ticketSlides.getSlides();
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        if (shape.getType() === SlidesApp.ShapeType.TEXT_BOX) {
          let text = shape.getText().asString();
          // Ersetze Platzhalter
          text = text.replace(/{ID}/g, ticketData.id);
          text = text.replace(/{NAME}/g, ticketData.name);
          text = text.replace(/{TYPE}/g, ticketData.type);
          text = text.replace(/{DATE}/g, ticketData.date);
          shape.getText().setText(text);
        }
      }
    }
    // Speichere die Änderungen
    ticketSlides.saveAndClose();
    return {
      id: ticketData.id,
      name: ticketData.name,
      type: ticketData.type,
      fileId: ticketFile.getId(),
      url: ticketFile.getUrl()
    };
  } catch (e) {
    Logger.log('Fehler in createTicketFromSlides: ' + e.message);
    throw e;
  }
}

/**
 * Generiert eine Version 4 UUID (Universally Unique Identifier) für Ticket-IDs.
 * @return {string} Eine zufällige UUID.
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Generiert einen QR-Code als Bild-Blob für den gegebenen Text
 * mithilfe der qrserver.com API.
 * @param {string} text Der Text, der im QR-Code kodiert werden soll.
 * @return {Blob | null} Das QR-Code Bild als Blob oder null bei Fehler.
 */
function generateQrCode(text) {
  try {
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(text) + '&format=png';
    const response = UrlFetchApp.fetch(qrCodeUrl);
    if (response.getResponseCode() === 200) {
      return response.getBlob();
    } else {
      Logger.log('Fehler beim Abrufen des QR-Codes. Status: ' + response.getResponseCode());
      return null;
    }
  } catch (error) {
    Logger.log('Fehler in generateQrCode: ' + error);
    return null;
  }
}

// Weitere Hilfsfunktionen für Ticket-Import, E-Mail-Versand etc. können hier ergänzt werden. 
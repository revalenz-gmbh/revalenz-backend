/**
 * Hilfsklasse für Drive-Operationen
 * @class
 */
class DriveUtils {
  /**
   * Erstellt ein Dokument im angegebenen Ordner
   * @param {string} folderId - Die ID des Zielordners
   * @param {string} title - Der Titel des Dokuments
   * @param {string} content - Der Inhalt des Dokuments
   * @returns {Object} Das erstellte Dokument
   */
  static createDocumentInFolder(folderId, title, content) {
    try {
      // Erstelle das Dokument
      const doc = DocumentApp.create(title);
      
      // Füge den Inhalt hinzu
      doc.getBody().setText(content);
      
      // Verschiebe das Dokument in den Zielordner
      const file = DriveApp.getFileById(doc.getId());
      const folder = DriveApp.getFolderById(folderId);
      file.moveTo(folder);
      
      return {
        id: doc.getId(),
        url: doc.getUrl(),
        title: doc.getName()
      };
    } catch (error) {
      console.error('Fehler beim Erstellen des Dokuments:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob ein Ordner existiert
   * @param {string} folderId - Die ID des zu prüfenden Ordners
   * @returns {boolean} true, wenn der Ordner existiert
   */
  static folderExists(folderId) {
    try {
      DriveApp.getFolderById(folderId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = DriveUtils;
} 
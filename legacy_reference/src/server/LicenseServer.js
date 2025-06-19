/**
 * LicenseServer - Express-Server für die Lizenzvalidierung
 * @class
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const LicenseDatabase = require('../database/LicenseDatabase');

class LicenseServer {
  /**
   * Erstellt eine neue Instanz des LicenseServer
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      port: 3000,
      jwtSecret: 'your-secret-key',
      ...config
    };
    this.app = express();
    this.db = new LicenseDatabase(config.database);
    this._setupMiddleware();
    this._setupRoutes();
  }

  /**
   * Startet den Server
   * @returns {Promise<void>}
   */
  async start() {
    try {
      await this.db.connect();
      return new Promise((resolve) => {
        this.server = this.app.listen(this.config.port, () => {
          console.log(`Lizenzserver läuft auf Port ${this.config.port}`);
          resolve();
        });
      });
    } catch (error) {
      console.error('Fehler beim Serverstart:', error);
      throw error;
    }
  }

  /**
   * Stoppt den Server
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      await this.db.disconnect();
      return new Promise((resolve) => {
        if (this.server) {
          this.server.close(() => {
            console.log('Lizenzserver gestoppt');
            resolve();
          });
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('Fehler beim Serverstopp:', error);
      throw error;
    }
  }

  /**
   * Richtet die Middleware ein
   * @private
   */
  _setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(this._authMiddleware.bind(this));
  }

  /**
   * Authentifizierungs-Middleware
   * @private
   * @param {Object} req - Der Request
   * @param {Object} res - Die Response
   * @param {Function} next - Die Next-Funktion
   */
  _authMiddleware(req, res, next) {
    // Überspringe Auth für Test-Endpunkte
    if (req.path.startsWith('/test')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Kein Auth-Token vorhanden'
      });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, this.config.jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Ungültiges Auth-Token'
      });
    }
  }

  /**
   * Richtet die Routen ein
   * @private
   */
  _setupRoutes() {
    // Lizenzvalidierung
    this.app.post('/v1/licenses/validate', this._handleLicenseValidation.bind(this));
    
    // Statusabfrage
    this.app.get('/v1/licenses/status', this._handleStatusCheck.bind(this));
    
    // Test-Endpunkte
    this.app.post('/test/licenses/validate', this._handleTestValidation.bind(this));
    this.app.get('/test/licenses/status', this._handleTestStatus.bind(this));
  }

  /**
   * Behandelt die Lizenzvalidierung
   * @private
   * @param {Object} req - Der Request
   * @param {Object} res - Die Response
   */
  async _handleLicenseValidation(req, res) {
    try {
      const { licenseKey, deviceId } = req.body;
      
      if (!licenseKey) {
        return res.status(400).json({
          success: false,
          message: 'Lizenzschlüssel fehlt'
        });
      }

      // Validiere die Lizenz
      const validationResult = await this._validateLicense(licenseKey, deviceId);
      
      res.json(validationResult);
    } catch (error) {
      console.error('Fehler bei der Lizenzvalidierung:', error);
      res.status(500).json({
        success: false,
        message: 'Interner Serverfehler'
      });
    }
  }

  /**
   * Behandelt die Statusabfrage
   * @private
   * @param {Object} req - Der Request
   * @param {Object} res - Die Response
   */
  async _handleStatusCheck(req, res) {
    try {
      const deviceId = req.query.deviceId;
      
      // Hole den Status
      const status = await this._getLicenseStatus(deviceId);
      
      res.json(status);
    } catch (error) {
      console.error('Fehler bei der Statusabfrage:', error);
      res.status(500).json({
        success: false,
        message: 'Interner Serverfehler'
      });
    }
  }

  /**
   * Behandelt die Test-Validierung
   * @private
   * @param {Object} req - Der Request
   * @param {Object} res - Die Response
   */
  async _handleTestValidation(req, res) {
    try {
      const { licenseKey } = req.body;
      
      // Simuliere eine erfolgreiche Validierung für Test-Lizenzen
      if (licenseKey.startsWith('TEST-')) {
        res.json({
          success: true,
          message: 'Test-Lizenz validiert',
          license: {
            type: 'TEST',
            features: ['ticket_creation', 'ticket_scanning'],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Ungültige Test-Lizenz'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Test-Validierung fehlgeschlagen'
      });
    }
  }

  /**
   * Behandelt die Test-Statusabfrage
   * @private
   * @param {Object} req - Der Request
   * @param {Object} res - Die Response
   */
  async _handleTestStatus(req, res) {
    try {
      // Simuliere einen gültigen Status für Tests
      res.json({
        isValid: true,
        features: ['ticket_creation', 'ticket_scanning'],
        message: 'Test-Status OK'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Test-Statusabfrage fehlgeschlagen'
      });
    }
  }

  /**
   * Validiert eine Lizenz
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Promise<Object>} Das Validierungsergebnis
   */
  async _validateLicense(licenseKey, deviceId) {
    try {
      // Lade die Lizenz aus der Datenbank
      const license = await this.db.loadLicense(licenseKey);
      
      if (!license) {
        return {
          success: false,
          message: 'Lizenz nicht gefunden'
        };
      }

      // Überprüfe das Ablaufdatum
      if (new Date(license.expiresAt) < new Date()) {
        return {
          success: false,
          message: 'Lizenz abgelaufen'
        };
      }

      // Überprüfe die Gerätezuordnung
      const deviceMapping = await this.db.loadDeviceMapping(licenseKey);
      if (deviceMapping && deviceMapping.deviceId !== deviceId) {
        return {
          success: false,
          message: 'Lizenz bereits auf einem anderen Gerät aktiviert'
        };
      }

      // Speichere die Gerätezuordnung
      await this.db.saveDeviceMapping(licenseKey, deviceId);

      return {
        success: true,
        message: 'Lizenz validiert',
        license: {
          type: license.type,
          features: license.features,
          expiresAt: license.expiresAt
        }
      };
    } catch (error) {
      console.error('Fehler bei der Lizenzvalidierung:', error);
      throw error;
    }
  }

  /**
   * Holt den Lizenzstatus
   * @private
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Promise<Object>} Der Lizenzstatus
   */
  async _getLicenseStatus(deviceId) {
    try {
      // Finde die Lizenz für das Gerät
      const deviceMapping = await this.db.db.collection('device_mappings')
        .findOne({ deviceId });

      if (!deviceMapping) {
        return {
          isValid: false,
          features: [],
          message: 'Keine Lizenz für dieses Gerät gefunden'
        };
      }

      // Lade die Lizenz
      const license = await this.db.loadLicense(deviceMapping.licenseKey);
      
      if (!license) {
        return {
          isValid: false,
          features: [],
          message: 'Lizenz nicht gefunden'
        };
      }

      // Überprüfe das Ablaufdatum
      const isValid = new Date(license.expiresAt) > new Date();

      return {
        isValid,
        features: isValid ? license.features : [],
        message: isValid ? 'OK' : 'Lizenz abgelaufen'
      };
    } catch (error) {
      console.error('Fehler bei der Statusabfrage:', error);
      throw error;
    }
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseServer;
} 
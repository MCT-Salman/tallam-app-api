import { initializeDefaultSettings } from '../services/appSettings.service.js';

/**
 * Initialize app settings with default values
 */
export const initializeAppSettings = async () => {
  try {
    console.log('Initializing app settings...');
    await initializeDefaultSettings();
    console.log('App settings initialized successfully');
  } catch (error) {
    console.error('Error initializing app settings:', error);
    throw error;
  }
};

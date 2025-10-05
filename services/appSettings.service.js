import prisma from '../prisma/client.js';

/**
 * Get a setting value by key
 * @param {string} key - The setting key
 * @returns {Promise<string|null>} - The setting value or null if not found
 */
export const getSetting = async (key) => {
  const setting = await prisma.appSettings.findUnique({
    where: { key }
  });

  return setting ? setting.value : null;
};

/**
 * Get a boolean setting value by key
 * @param {string} key - The setting key
 * @param {boolean} defaultValue - Default value if setting not found
 * @returns {Promise<boolean>} - The boolean value of the setting
 */
export const getBooleanSetting = async (key, defaultValue = false) => {
  const value = await getSetting(key);

  if (value === null) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

/**
 * Get a number setting value by key
 * @param {string} key - The setting key
 * @param {number} defaultValue - Default value if setting not found
 * @returns {Promise<number>} - The number value of the setting
 */
export const getNumberSetting = async (key, defaultValue = 0) => {
  const value = await getSetting(key);

  if (value === null) {
    return defaultValue;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get all settings
 * @returns {Promise<Array>} - Array of all settings
 */
export const getAllSettings = async () => {
  return prisma.appSettings.findMany({
    orderBy: { key: 'asc' }
  });
};

/**
 * Set a setting value
 * @param {string} key - The setting key
 * @param {string} value - The setting value
 * @returns {Promise<Object>} - The created/updated setting
 */
export const setSetting = async (key, value) => {
  return prisma.appSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
};

/**
 * Create a new setting
 * @param {string} key - The setting key
 * @param {string} value - The setting value
 * @returns {Promise<Object>} - The created setting
 */
export const createSetting = async (key, value) => {
  return prisma.appSettings.create({
    data: { key, value }
  });
};

/**
 * Update a setting value
 * @param {string} key - The setting key
 * @param {string} value - The setting value
 * @returns {Promise<Object>} - The updated setting
 */
export const updateSetting = async (key, value) => {
  return prisma.appSettings.update({
    where: { key },
    data: { value }
  });
};

/**
 * Delete a setting
 * @param {string} key - The setting key
 * @returns {Promise<Object>} - The deleted setting
 */
export const deleteSetting = async (key) => {
  return prisma.appSettings.delete({
    where: { key }
  });
};

/**
 * Initialize default settings
 * @returns {Promise<void>}
 */
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    { key: 'allowRating', value: 'true' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'registrationEnabled', value: 'true' },
    { key: 'maxQuizAttempts', value: '3' },
    { key: 'sessionTimeout', value: '30' },
    { key: 'fileUploadLimit', value: '50' }
  ];

  for (const setting of defaultSettings) {
    await setSetting(setting.key, setting.value);
  }
};

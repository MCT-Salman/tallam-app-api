import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0];
      return firebaseApp;
    }

    // Initialize Firebase with service account
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.warn('🔥 Firebase configuration incomplete. Push notifications will be disabled.');
      console.warn('💡 To enable push notifications:');
      console.warn('   1. Go to Firebase Console > Project Settings > Service Accounts');
      console.warn('   2. Generate a new private key');
      console.warn('   3. Add the credentials to your .env file');
      console.warn('   4. Restart the server');
      return null;
    }

    // Additional validation for private key format
    if (!serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
      console.warn('🔥 Firebase private key format is invalid. Push notifications will be disabled.');
      console.warn('💡 Make sure the private key includes the full PEM format with headers and footers');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }
};

/**
 * Get Firebase Messaging instance
 */
export const getMessaging = () => {
  try {
    const app = initializeFirebase();
    if (!app) {
      return null;
    }
    return admin.messaging();
  } catch (error) {
    console.error('Failed to get Firebase Messaging instance:', error.message);
    return null;
  }
};

/**
 * Send push notification to a single device
 * @param {string} fcmToken - FCM token of the device
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 * @returns {Promise<string|null>} - Message ID if successful, null if failed
 */
export const sendPushNotification = async (fcmToken, notification, data = {}) => {
  try {
    const messaging = getMessaging();
    if (!messaging || !fcmToken) {
      return null;
    }

    // Validate and format imageUrl
    const validImageUrl = notification.imageUrl && isValidUrl(notification.imageUrl)
      ? notification.imageUrl
      : null;

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(validImageUrl && { imageUrl: validImageUrl })
      },
      data: convertDataToStrings({
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...(notification.link && { link: notification.link })
      }),
      android: {
        notification: {
          channelId: 'taalam_notifications',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;

  } catch (error) {
    console.error('❌ Failed to send push notification:', error.message);
    return null;
  }
};

/**
 * Send push notification to multiple devices
 * @param {string[]} fcmTokens - Array of FCM tokens
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 * @returns {Promise<object>} - Response with success and failure counts
 */
export const sendPushNotificationToMultiple = async (fcmTokens, notification, data = {}) => {
  try {
    const messaging = getMessaging();
    if (!messaging || !fcmTokens || fcmTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // Validate and format imageUrl
    const validImageUrl = notification.imageUrl && isValidUrl(notification.imageUrl)
      ? notification.imageUrl
      : null;

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(validImageUrl && { imageUrl: validImageUrl })
      },
      data: convertDataToStrings({
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...(notification.link && { link: notification.link })
      }),
      android: {
        notification: {
          channelId: 'taalam_notifications',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      tokens: fcmTokens
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`✅ Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
    
    // Log failed tokens for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${fcmTokens[idx]}:`, resp.error);
        }
      });
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };

  } catch (error) {
    console.error('❌ Failed to send push notifications to multiple devices:', error.message);
    return { successCount: 0, failureCount: fcmTokens.length };
  }
};

/**
 * Check if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} - True if valid URL
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // Check if it's a relative URL that starts with http/https
    return string.startsWith('http://') || string.startsWith('https://');
  }
};

/**
 * Convert data object to Firebase-compatible format (all string values)
 * @param {object} data - Data object to convert
 * @returns {object} - Converted data object with string values only
 */
const convertDataToStrings = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const convertedData = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (value === null || value === undefined) {
      // Skip null/undefined values
      return;
    }

    if (typeof value === 'string') {
      convertedData[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      convertedData[key] = String(value);
    } else if (typeof value === 'object') {
      // Convert objects to JSON strings
      convertedData[key] = JSON.stringify(value);
    } else {
      // Convert anything else to string
      convertedData[key] = String(value);
    }
  });

  return convertedData;
};

/**
 * Validate FCM token format (simple validation)
 * @param {string} fcmToken - FCM token to validate
 * @returns {boolean} - True if valid format
 */
const validateFCMTokenFormat = (fcmToken) => {
  if (!fcmToken || typeof fcmToken !== 'string') {
    return false;
  }

  // FCM tokens are typically 152+ characters long
  if (fcmToken.length < 140) {
    return false;
  }

  // Basic format validation (alphanumeric, hyphens, underscores, colons)
  const fcmTokenRegex = /^[a-zA-Z0-9_:-]+$/;
  return fcmTokenRegex.test(fcmToken);
};

/**
 * Validate FCM token (advanced validation with Firebase)
 * @param {string} fcmToken - FCM token to validate
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
export const validateFCMTokenAdvanced = async (fcmToken) => {
  try {
    const messaging = getMessaging();
    if (!messaging || !fcmToken) {
      return false;
    }

    // Try to send a dry-run message to validate the token
    const message = {
      token: fcmToken,
      notification: {
        title: 'Test',
        body: 'Test'
      },
      dryRun: true
    };

    await messaging.send(message);
    return true;

  } catch (error) {
    console.error('Invalid FCM token:', error.message);
    return false;
  }
};

// Export simple validation function for use in services
export const validateFCMToken = validateFCMTokenFormat;

export default {
  initializeFirebase,
  getMessaging,
  sendPushNotification,
  sendPushNotificationToMultiple,
  validateFCMToken: validateFCMTokenFormat,
  validateFCMTokenAdvanced: validateFCMTokenAdvanced
};

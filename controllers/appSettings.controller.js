import { serializeResponse } from "../utils/serialize.js";
import {
  getSetting,
  getBooleanSetting,
  getNumberSetting,
  getAllSettings,
  setSetting,
  createSetting,
  updateSetting,
  deleteSetting
} from "../services/appSettings.service.js";

// --- Student Controllers ---
export const GetContactSetting = async (req, res, next) => {
  try {
    const value = await getSetting('whatsapp');
    const value2 = await getSetting('telegram');
    res.json({
      success: true,
      message: "تم جلب إعدادات التطبيق بنجاح",
      data: {
        'whatsapp': value,
        'telegram': value2,
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Get all app settings (Admin only)
 * GET /api/admin/settings
 */
export const adminGetSettings = async (req, res, next) => {
  try {
    const settings = await getAllSettings();

    res.json({
      success: true,
      message: "تم جلب إعدادات التطبيق بنجاح",
      data: serializeResponse(settings)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Get a specific setting by key (Admin only)
 * GET /api/admin/settings/:key
 */
export const adminGetSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = await getSetting(key);

    if (value === null) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الإعداد المطلوب"
      });
    }

    res.json({
      success: true,
      message: "تم جلب الإعداد بنجاح",
      data: {
        key,
        value
      }
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Create a new setting (Admin only)
 * POST /api/admin/settings
 */
export const adminCreateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "يجب توفير اسم الإعداد وقيمته"
      });
    }

    // Check if setting already exists
    const existingSetting = await getSetting(key);
    if (existingSetting !== null) {
      return res.status(409).json({
        success: false,
        message: "الإعداد موجود بالفعل"
      });
    }

    const setting = await createSetting(key, String(value));

    res.status(201).json({
      success: true,
      message: "تم إنشاء الإعداد بنجاح",
      data: serializeResponse(setting)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Update an existing setting (Admin only)
 * PUT /api/admin/settings/:key
 */
export const adminUpdateSetting = async (req, res, next) => {
  try {
    const { key } = req.body;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "يجب توفير قيمة الإعداد"
      });
    }

    // Check if setting exists
    const existingSetting = await getSetting(key);
    if (existingSetting === null) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الإعداد المطلوب"
      });
    }

    const setting = await updateSetting(key, String(value));

    res.json({
      success: true,
      message: "تم تحديث الإعداد بنجاح",
      data: serializeResponse(setting)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Update multiple settings at once (Admin only)
 * PUT /api/admin/settings
 */
export const adminUpdateSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;

    if (!settingsData || typeof settingsData !== 'object') {
      return res.status(400).json({
        success: false,
        message: "يجب توفير بيانات الإعدادات"
      });
    }

    const updatedSettings = [];

    for (const [key, value] of Object.entries(settingsData)) {
      if (value !== undefined) {
        await setSetting(key, String(value));
        const updatedSetting = await getSetting(key);
        updatedSettings.push({ key, value: updatedSetting });
      }
    }

    res.json({
      success: true,
      message: "تم تحديث الإعدادات بنجاح",
      data: serializeResponse(updatedSettings)
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

/**
 * Delete a setting (Admin only)
 * DELETE /api/admin/settings/:key
 */
export const adminDeleteSetting = async (req, res, next) => {
  try {
    const { key } = req.params;

    // Check if setting exists
    const existingSetting = await getSetting(key);
    if (existingSetting === null) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الإعداد المطلوب"
      });
    }

    await deleteSetting(key);

    res.json({
      success: true,
      message: "تم حذف الإعداد بنجاح"
    });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

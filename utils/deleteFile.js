import fs from "fs";
import path from "path";

/**
 * يحذف ملف من مجلد public
 * @param {string} fileUrl - المسار كما هو محفوظ في قاعدة البيانات
 */
export const deleteFile = (fileUrl) => {
  if (!fileUrl) return;

  try {
    const relativePath = fileUrl.replace(/^\/?uploads\/images\//, "");
    const filePath = path.join(process.cwd(), "uploads", "images", relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // File deleted successfully - log only in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`تم حذف الملف: ${fileUrl}`);
      }
    }
  } catch (err) {
    // Log errors only in development or production for debugging
    if (process.env.NODE_ENV !== 'test') {
      console.warn("فشل حذف الملف:", err.message);
    }
  }
};

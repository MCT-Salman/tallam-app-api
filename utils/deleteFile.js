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
    console.log(`filePath: ${filePath}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(` تم حذف الملف: ${fileUrl}`);
    }
  } catch (err) {
    console.warn(" فشل حذف الملف:", err.message);
  }
};

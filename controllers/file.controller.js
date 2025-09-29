import { serializeResponse } from "../utils/serialize.js";
import { createFile, listFiles, getFileById, updateFile, deleteFile } from "../services/file.service.js";
import path from "path";

export const adminListFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const courseLevelId = req.query.courseLevelId ? parseInt(req.query.courseLevelId, 10) : undefined;
    const result = await listFiles({ courseLevelId }, { page, limit });
    res.json({ success: true, message: "تم جلب الملفات بنجاح", data: serializeResponse(result.data), pagination: result.pagination });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminCreateFile = async (req, res, next) => {
  try {
    const f = req.file;
    if (!f) {
      return res.status(400).json({ success: false, error: "الملف مطلوب" });
    }
    const courseLevelId = req.body.courseLevelId ? parseInt(req.body.courseLevelId, 10) : undefined;

    const fileRecord = await createFile({
      key: f.filename,
      url: `/uploads/files/general/${f.filename}`,
      name: path.parse(f.originalname).name,
      type: f.mimetype,
      size: f.size,
      meta: req.body.meta ? JSON.parse(req.body.meta) : undefined,
      ...(courseLevelId ? { courseLevelId } : {})
    });

    res.status(201).json({ success: true, message: "تم رفع الملف وإنشاؤه بنجاح", data: serializeResponse(fileRecord) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminGetFile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await getFileById(id);
    if (!item) return res.status(404).json({ success: false, error: "الملف غير موجود" });
    res.json({ success: true, data: serializeResponse(item) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminUpdateFile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const f = req.file;
    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.courseLevelId) data.courseLevelId = parseInt(req.body.courseLevelId, 10);
    if (req.body.meta) {
      try { data.meta = JSON.parse(req.body.meta); } catch { /* ignore bad meta */ }
    }
    if (f) {
      data.key = f.filename;
      data.url = `/uploads/files/general/${f.filename}`;
      data.type = f.mimetype;
      data.size = f.size;
    }
    const updated = await updateFile(id, data);
    res.json({ success: true, message: "تم تحديث الملف بنجاح", data: serializeResponse(updated) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteFile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteFile(id);
    res.json({ success: true, message: "تم حذف الملف بنجاح" });
  } catch (e) {
    if (e.code === 'P2025') { e.statusCode = 404; e.message = "الملف غير موجود"; }
    else { e.statusCode = e.statusCode || 400; }
    next(e);
  }
};

// Public endpoints
export const publicListFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const courseLevelId = parseInt(req.params.id, 10);
    const result = await listFiles(courseLevelId, { page, limit });
    res.json({ success: true, data: serializeResponse(result.data), pagination: result.pagination });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicGetFile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await getFileById(id);
    if (!item) return res.status(404).json({ success: false, error: "الملف غير موجود" });
    res.json({ success: true, data: serializeResponse(item) });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

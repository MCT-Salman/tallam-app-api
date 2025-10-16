import {
  createAdmin,
  setUserRole,
  toggleUserActive,
  adminLogin as adminLoginService,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} from "../services/admin.service.js";
import { SUCCESS_REQUEST, SUCCESS_LOGIN } from "../validators/messagesResponse.js";

/**
 * @route ~/api/admin/create-subadmin
 * @desc create new account with subadmin role
 * @access private (only admin)
 */
export const addAdmin = async (req, res, next) => {
  try {
    const { phone, name, sex, birthDate, country, countryCode, role, expiresAt, username, email, password, isActive } = req.body;

    const user = await createAdmin(phone, name, sex, birthDate, country, countryCode, role, expiresAt, username, email, password, isActive);
    res.json({
      success: true,
      message: "تم إنشاء حساب المشرف بنجاح",
      data: {
        ...user
      }
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    return next(e);
  }
};

/**
 * @route ~/api/admin/set-role
 * @desc change role for any account
 * @access private (only admin)
 */
export const changeRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const updated = await setUserRole(userId, role);
    res.json({
      success: true,
      message: "تم تغيير الدور بنجاح",
      data: {
        ...updated
      }
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    return next(e);
  }
};

/**
 * @route ~/api/admin/toggle-active
 * @desc disable or enable for any account
 * @access private (only admin)
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId, active } = req.body;
    const updated = await toggleUserActive(userId, active);
    const message = active ? "تم تفعيل الحساب بنجاح" : "تم تعطيل الحساب بنجاح";
    res.json({
      success: true,
      message,
      data: {
        ...updated
      }
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    return next(e);
  }
};

/**
 * @route ~/api/admin/login
 * @desc admin login with email or username + password
 * @access public
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await adminLoginService(identifier, password, req);
    res.json({
      success: SUCCESS_REQUEST,
      message: SUCCESS_LOGIN,
      data: {
        ...result
      }
    });
  } catch (e) {
    e.statusCode = e.statusCode || 401;
    return next(e);
  }
};

/**
 * @route ~/api/admin/list
 * @desc get all admins with pagination
 * @access private (only admin)
 */
export const listAdmins = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllAdmins(parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: "تم جلب قائمة المشرفين بنجاح",
      data: result
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    return next(e);
  }
};

/**
 * @route ~/api/admin/:id
 * @desc get admin by ID
 * @access private (only admin)
 */
export const getAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await getAdminById(id);

    res.json({
      success: true,
      message: "تم جلب بيانات المشرف بنجاح",
      data: admin
    });
  } catch (e) {
    e.statusCode = e.statusCode || 404;
    return next(e);
  }
};

/**
 * @route ~/api/admin/:id
 * @desc update admin information
 * @access private (only admin)
 */
export const editAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAdmin = await updateAdmin(id, updateData);

    res.json({
      success: true,
      message: "تم تحديث بيانات المشرف بنجاح",
      data: updatedAdmin
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    return next(e);
  }
};

/**
 * @route ~/api/admin/:id
 * @desc delete admin (deactivate)
 * @access private (only admin)
 */
export const removeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAdmin(id);

    res.json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
        username: result.username,
        email: result.email
      }
    });
  } catch (e) {
    e.statusCode = e.statusCode || 404;
    return next(e);
  }
};


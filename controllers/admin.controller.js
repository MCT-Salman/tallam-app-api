import { createSubAdmin, setUserRole, toggleUserActive } from "../services/admin.service.js";

/**
 * @route ~/api/admin/create-subadmin
 * @desc create new account with subadmin role
 * @access private (only admin)
 */
export const addSubAdmin = async (req, res, next) => {
  try {
    const { phone, name, birthDate } = req.body;
    const user = await createSubAdmin(phone, name, birthDate);
    res.json({ 
      success: true, 
      message: "تم إنشاء حساب المشرف الفرعي بنجاح",
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

import * as UserService from '../services/user.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

export const adminGetAllUsers = async (req, res, next) => {
  try {
    const { skip, take, q, role, country, isActive } = req.query;
    const filters = { q, role, country, isActive: isActive ? isActive === 'true' : undefined };
    const result = await UserService.getAllUsers(filters, parseInt(skip) || 0, parseInt(take) || 20);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب قائمة الطلاب بنجاح',
      data: serializeResponse(result),
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(parseInt(req.params.id));
    if (!user) {
      return res.status(NOT_FOUND_STATUS_CODE).json({ success: FAILURE_REQUEST, message: 'هذا الحساب غير موجود' });
    }
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب بيانات الطالب بنجاح',
      data: serializeResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreateUser = async (req, res, next) => {
  try {
    const user = await UserService.createUserByAdmin(req.body,req.user);
    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم إنشاء حساب الطالب بنجاح',
      data: serializeResponse(user),
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminUpdateUser = async (req, res, next) => {
  try {

    const user = await UserService.updateUserByAdmin(parseInt(req.params.id), req.body,req.user);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم تحديث بيانات الطالب بنجاح',
      data: serializeResponse(user),
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUserById(parseInt(req.params.id),req.user);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم حذف الطالب بنجاح',
    });
  } catch (error) {
    // Handle Prisma's P2025 error for record not found
    if (error.code === 'P2025') {
      return res.status(NOT_FOUND_STATUS_CODE).json({ success: FAILURE_REQUEST, message: 'الحساب غير موجود' });
    }
    next(error);
  }
};


export const adminToggleUserActive = async (req, res, next) => {
  try {
    const user = await UserService.toggleUserActiveStatus(parseInt(req.params.id), req.user);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم ${user.isActive ? "تفعيل" : "تعطيل"} الحساب بنجاح`,
      data: serializeResponse(user),
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

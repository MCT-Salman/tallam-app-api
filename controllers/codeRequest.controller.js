import * as CodeRequestService from '../services/codeRequest.service.js';
import { serializeResponse } from '../utils/serialize.js';
import { FAILURE_REQUEST, SUCCESS_REQUEST } from '../validators/messagesResponse.js';
import { BAD_REQUEST_STATUS_CODE, NOT_FOUND_STATUS_CODE, SUCCESS_CREATE_STATUS_CODE, SUCCESS_STATUS_CODE } from '../validators/statusCode.js';

// For Students
export const studentCreateCodeRequest = async (req, res, next) => {
  try {
    const { courseId, contact } = req.body;
    const userId = req.user.id;

    const request = await CodeRequestService.createCodeRequest(userId, courseId, contact);
    res.status(SUCCESS_CREATE_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم إرسال طلب الكود بنجاح.',
      data: serializeResponse(request),
    });
  } catch (error) {
    error.statusCode = BAD_REQUEST_STATUS_CODE;
    next(error);
  }
};

export const studentGetMyCodeRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requests = await CodeRequestService.getUserCodeRequests(userId);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب طلبات الأكواد الخاصة بك بنجاح.',
      data: serializeResponse(requests),
    });
  } catch (error) {
    next(error);
  }
};

// For Admins
export const adminGetAllCodeRequests = async (req, res, next) => {
  try {
    const { skip, take, status } = req.query;
    const filters = { status };
    const result = await CodeRequestService.getAllCodeRequests(filters, parseInt(skip) || 0, parseInt(take) || 20);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: 'تم جلب جميع طلبات الأكواد بنجاح.',
      data: serializeResponse(result),
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCodeRequestStatus = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const request = await CodeRequestService.updateCodeRequestStatus(requestId, status);
    res.status(SUCCESS_STATUS_CODE).json({
      success: SUCCESS_REQUEST,
      message: `تم تحديث حالة الطلب بنجاح.`,
      data: serializeResponse(request),
    });
  } catch (error) {
    if (error.message === 'الطلب غير موجود') {
      error.statusCode = NOT_FOUND_STATUS_CODE;
    } else {
      error.statusCode = BAD_REQUEST_STATUS_CODE;
    }
    next(error);
  }
};

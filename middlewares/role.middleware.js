import { FAILURE_REQUEST, NO_AUTH } from "../validators/messagesResponse.js";

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: FAILURE_REQUEST, 
        message: NO_AUTH,
        data: {}
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
         success: FAILURE_REQUEST, 
        message: NO_AUTH,
        data: {}
      });
    }

    next();
  };
};

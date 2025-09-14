import xss from "xss";

function sanitizeInput(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);   // تنظيف النصوص
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInput(obj[key]);    // تنظيف الكائنات المتداخلة (nested objects)
    }
  }
}

export function xssSanitizer(req, res, next) {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
}

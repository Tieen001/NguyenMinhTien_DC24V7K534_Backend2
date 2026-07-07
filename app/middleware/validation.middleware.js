const validator = require("validator");

const validateRegister = (req, res, next) => {
  const { fullname, email, phone, password } = req.body;
  const errors = [];

  if (!fullname || fullname.trim().length < 2) {
    errors.push("Họ tên phải có ít nhất 2 ký tự");
  }

  if (!email || !validator.isEmail(email)) {
    errors.push("Email không hợp lệ");
  }

  if (phone && !validator.isMobilePhone(phone, "vi-VN")) {
    errors.push("Số điện thoại không hợp lệ");
  }

  if (!password || password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push("Email không hợp lệ");
  }

  if (!password || password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };

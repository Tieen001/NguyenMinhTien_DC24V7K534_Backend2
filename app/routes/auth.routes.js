const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");

// UserService sẽ được inject qua req
// Public routes
router.post("/register", async (req, res, next) => {
  try {
    const user = await req.userService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await req.userService.login(email, password);
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Đăng xuất thành công",
  });
});

module.exports = router;

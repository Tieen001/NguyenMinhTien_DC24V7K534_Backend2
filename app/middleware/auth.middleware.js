const { verifyToken } = require("../utils/jwt");
const { ObjectId } = require("mongodb");
const MongoDB = require("../utils/mongodb.util");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    const db = MongoDB.getDB();
    const usersCollection = db.collection("users");

    // Tìm user bằng ObjectId
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } },
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xác thực: " + error.message,
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };

// app/services/user.service.js
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserService {
  constructor(client) {
    this.collection = client.db().collection("users");
  }

  async register(payload) {
    const existingUser = await this.collection.findOne({
      email: payload.email.toLowerCase(),
    });

    if (existingUser) {
      throw new Error("Email đã được đăng ký");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const user = {
      fullname: payload.fullname,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      password: hashedPassword,
      role: payload.role || "user",
      isActive: true,
    };

    const result = await this.collection.insertOne(user);

    const newUser = await this.collection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } },
    );

    return newUser;
  }

  async login(email, password) {
    const user = await this.collection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    if (!user.isActive) {
      throw new Error("Tài khoản đã bị khóa");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" },
    );

    delete user.password;

    return {
      user,
      token,
    };
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }

    const user = await this.collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } },
    );

    if (!user) {
      throw new Error("Không tìm thấy user");
    }

    return user;
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }

    const allowedUpdates = ["fullname", "phone"];
    const updateData = {};

    Object.keys(payload).forEach((key) => {
      if (allowedUpdates.includes(key) && payload[key] !== undefined) {
        updateData[key] = payload[key];
      }
    });

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      {
        returnDocument: "after",
        projection: { password: 0 },
      },
    );

    if (!result) {
      throw new Error("Không tìm thấy user");
    }

    return result;
  }

  async changePassword(id, oldPassword, newPassword) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }

    const user = await this.collection.findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      throw new Error("Không tìm thấy user");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } },
    );

    return { message: "Đổi mật khẩu thành công" };
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }

    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });

    return result;
  }
}

module.exports = UserService;

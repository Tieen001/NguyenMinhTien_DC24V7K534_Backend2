// server.js
const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const ContactService = require("./app/services/contact.service");
const UserService = require("./app/services/user.service");
const contactRouter = require("./app/routes/contact.route");
const authRoutes = require("./app/routes/auth.routes");

async function startServer() {
  try {
    // 1. Kết nối MongoDB và lấy client
    const client = await MongoDB.connect(config.db.uri); // <-- Lấy client
    console.log("Connected to MongoDB.");

    // 2. Khởi tạo services với client
    const contactService = new ContactService(client);
    const userService = new UserService(client);

    // 3. Inject services vào req
    app.use((req, res, next) => {
      req.contactService = contactService;
      req.userService = userService;
      next();
    });

    // 4. Định nghĩa routes
    app.use("/api/auth", authRoutes);
    app.use("/api/contacts", contactRouter);

    // 5. Khởi động server
    const PORT = config.app.port || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Contacts API: http://localhost:${PORT}/api/contacts`);
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit();
  }
}

startServer();

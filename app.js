const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const MongoDB = require("./app/utils/mongodb.util");
const ContactService = require("./app/services/contact.service");
const UserService = require("./app/services/user.service");
const contactRouter = require("./app/routes/contact.route");
const authRoutes = require("./app/routes/auth.routes");
const app = express();

app.use(cors());
app.use(express.json());

// ============ INJECT SERVICES ============
app.use((req, res, next) => {
  try {
    const client = MongoDB.getClient();
    req.contactService = new ContactService(client);
    req.userService = new UserService(client);
    next();
  } catch (error) {
    next(new ApiError(500, "Database not connected"));
  }
});

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to contact book application." });
});

// ============ ERROR HANDLERS ============
// handle 404 response
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

// define error-handling middleware last
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;

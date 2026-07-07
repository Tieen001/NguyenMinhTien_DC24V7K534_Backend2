const { MongoClient } = require("mongodb");

class MongoDB {
  static client = null;
  static db = null;

  static async connect(uri) {
    if (this.client) {
      console.log("✅ Using existing MongoDB connection");
      return this.client;
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      console.log("✅ Connected to MongoDB successfully");

      // Lưu database instance
      this.db = this.client.db();

      return this.client;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  static getClient() {
    if (!this.client) {
      throw new Error("MongoDB not connected. Call connect() first.");
    }
    return this.client;
  }

  static getDB() {
    if (!this.db) {
      throw new Error("MongoDB not connected. Call connect() first.");
    }
    return this.db;
  }

  static async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("✅ MongoDB connection closed");
    }
  }
}

module.exports = MongoDB;

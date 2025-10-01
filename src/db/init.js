const sequelize = require("./sequelize");
require("../models/User.model");
require("../models/Book.model");
require("../models/Review.model");

async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    await sequelize.sync();
    console.log("Models synced...");
  } catch (err) {
    console.error("DB init error:", err);
    process.exit(1);
  }
}

module.exports = initDB;

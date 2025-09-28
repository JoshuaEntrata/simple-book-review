const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const db = new Database("db");

function migrate() {
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `
  ).run();

  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `
  ).run();

  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER,
            user_id INTEGER,
            rating INTEGER,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `
  ).run();

  const adminUser = db
    .prepare(`SELECT id FROM users WHERE username = ?`)
    .get("admin");

  if (!adminUser) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.prepare(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`
    ).run("admin", hash, "admin");
    console.log("Created default admin admin user...");
  }
}

migrate();

module.exports = db;

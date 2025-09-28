const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const cache = require("../utils/cache");

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `
        SELECT b.*,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN reviews r ON r.book_id = b.id
        GROUP BY b.id    
    `
    )
    .all();
  res.json(rows);
});

router.post("/", authenticateJWT, authorizeRoles("admin"), (req, res) => {
  const { title, author } = req.body;
  if (!title) {
    return res.status(400).json({
      message: "Title required",
    });
  }

  const info = db
    .prepare("INSERT INTO books (title, author) VALUES (?, ?)")
    .run(title, author);
  cache.del("top_books");
  res.json({
    id: info.lastInsertRowid,
    title,
    author,
  });
});

router.get("/top", (req, res) => {
  const key = "top_books";
  const cached = cache.get(key);

  if (cached) {
    return res.json({
      cached: true,
      data: cached,
    });
  }

  const rows = db
    .prepare(
      `
        SELECT b.*,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN reviews r ON r.book_id = b.id
        GROUP BY b.id
        ORDER BY avg_rating DESC
        LIMIT 10
        `
    )
    .all();

  cache.set(key, rows, 60);
  res.json({
    cached: false,
    data: rows,
  });
});

router.get("/:id/reviews", (req, res) => {
  const bookId = req.params.id;
  const key = `book_reviews_${bookId}`;

  const cached = cache.get(key);
  if (cached) {
    return res.json({
      cached: true,
      data: cached,
    });
  }

  const rows = db
    .prepare(
      `
        SELECT r.*, u.username
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.book_id = ?
        ORDER BY r.created_at DESC
        `
    )
    .all(bookId);

  cache.set(key, rows, 30);
  res.json({ cached: false, data: rows });
});

router.post("/:id/reviews", authenticateJWT, (req, res) => {
  const bookId = req.params.id;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating 1 to 5 is required",
    });
  }

  const book = db.prepare("SELECT id FROM books WHERE id = ?").get(bookId);
  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  const info = db
    .prepare(
      `
        INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
    `
    )
    .run(bookId, req.user.id, rating, comment);

  cache.del(`book_reviews_${bookId}`);
  cache.del(`top_books`);

  res.json({
    id: info.lastInsertRowid,
    bookId: Number(bookId),
    userId: req.user.id,
    rating,
    comment,
  });
});

module.exports = router;

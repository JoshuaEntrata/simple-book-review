const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateJWT } = require("../middleware/auth");
const cache = require("../utils/cache");

router.delete("/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const review = db
    .prepare(
      `
        SELECT * FROM reviews WHERE id = ?
        `
    )
    .get(id);

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  if (req.user.role !== "admin" && review.user_id !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
  cache.del(`book_reviews_${review.book_id}`);
  cache.del("top_books");

  res.json({ message: "Deleted" });
});

module.exports = router;

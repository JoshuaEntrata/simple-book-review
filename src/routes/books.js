const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const cache = require("../utils/cache");
const BookService = require("../services/Book.service");
const ReviewService = require("../services/Review.service");

router.get("/", async (req, res) => {
  const books = await BookService.getAllBooks();

  res.json(books);
});

router.post("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  const { title, author } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title required",
    });
  }

  const book = await BookService.createBook(title, author);

  cache.del("top_books");
  res.json(book);
});

router.get("/top", async (req, res) => {
  const key = "top_books";
  const cached = cache.get(key);

  if (cached) {
    return res.json({
      cached: true,
      data: cached,
    });
  }

  const books = await BookService.getTopBooks();

  cache.set(key, books, 60);
  res.json({
    cached: false,
    data: books,
  });
});

router.get("/:id/reviews", async (req, res) => {
  const bookId = req.params.id;
  const key = `book_reviews_${bookId}`;

  const cached = cache.get(key);
  if (cached) {
    return res.json({
      cached: true,
      data: cached,
    });
  }

  const reviews = await ReviewService.getReviewsByBookId(bookId);

  cache.set(key, reviews, 30);
  res.json({ cached: false, data: reviews });
});

router.post("/:id/reviews", authenticateJWT, async (req, res) => {
  const bookId = req.params.id;
  const userId = req.user.id;

  const review = await ReviewService.addReview(req.body, bookId, userId);

  cache.del(`book_reviews_${bookId}`);
  cache.del(`top_books`);

  const { rating, comment, created_at } = review;

  res.json({
    bookId: Number(bookId),
    userId: req.user.id,
    rating,
    comment,
    created_at,
  });
});

router.delete(
  "/:bookId/reviews/:reviewId",
  authenticateJWT,
  async (req, res) => {
    const { bookId, reviewId } = req.params;
    const userId = req.user.id;

    const id = await ReviewService.deleteReview(bookId, reviewId, userId);

    cache.del(`book_reviews_${id}`);
    cache.del("top_books");

    res.json({ message: "Deleted" });
  }
);

module.exports = router;

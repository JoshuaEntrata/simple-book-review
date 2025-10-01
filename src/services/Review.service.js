const { Book, Review, User } = require("../models");

const ReviewService = {
  getReviewsByBookId: async (bookId) => {
    const existingBook = await Book.findOne({ where: { id: bookId } });
    if (!existingBook) {
      throw new Error("Book not found");
    }

    const reviews = await Review.findAll({
      attributes: {
        include: [[Review.sequelize.col("Users.username"), "reviewer"]],
      },
      include: [{ model: User, as: "Users", attributes: [] }],
      where: { book_id: bookId },
      group: ["Review.id"],
      order: [[Book.sequelize.col("Review.created_at"), "DESC"]],
    });

    return reviews;
  },

  addReview: async (reqBody, bookId, userId) => {
    const { rating, comment } = reqBody;
    if (rating < 1 || rating > 5) {
      throw new Error("Rating 1 to 5 is required");
    }

    const existingBook = await Book.findOne({ where: { id: bookId } });
    if (!existingBook) {
      throw new Error("Book not found");
    }

    const review = await Review.create({
      book_id: bookId,
      user_id: userId,
      rating,
      comment,
    });

    return review;
  },

  deleteReview: async (bookId, reviewId, userId) => {
    const existingBook = await Book.findOne({ where: { id: bookId } });
    if (!existingBook) {
      throw new Error("Book not found");
    }

    const review = await Review.findOne({
      where: { id: reviewId, book_id: bookId },
    });
    if (!review) {
      throw new Error("Review not found");
    }

    if (userId !== review.user_id) {
      throw new Error("Forbidden");
    }

    await Review.destroy({ where: { id: reviewId, book_id: bookId } });

    return bookId;
  },
};

module.exports = ReviewService;

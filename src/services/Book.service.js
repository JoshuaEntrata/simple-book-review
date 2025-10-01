const { Book, Review } = require("../models");

const BookService = {
  getAllBooks: async () => {
    const books = await Book.findAll({
      attributes: {
        include: [
          [
            Book.sequelize.fn("AVG", Book.sequelize.col("Reviews.rating")),
            "avg_rating",
          ],
          [
            Book.sequelize.fn("COUNT", Book.sequelize.col("Reviews.id")),
            "review_count",
          ],
        ],
      },
      include: [{ model: Review, as: "Reviews", attributes: [] }],
      group: ["Book.id"],
    });

    return books;
  },

  createBook: async (title, author) => {
    const book = await Book.create({ title, author });
    return book;
  },

  getTopBooks: async () => {
    const books = await Book.findAll({
      attributes: {
        include: [
          [
            Book.sequelize.fn("AVG", Book.sequelize.col("Reviews.rating")),
            "avg_rating",
          ],
          [
            Book.sequelize.fn("COUNT", Book.sequelize.col("Reviews.id")),
            "review_count",
          ],
        ],
      },
      include: [{ model: Review, as: "Reviews", attributes: [] }],
      group: ["Book.id"],
      order: [[Book.sequelize.fn("AVG", Book.sequelize.col("Reviews.rating"))]],
      limit: 5,
    });

    return books;
  },
};

module.exports = BookService;

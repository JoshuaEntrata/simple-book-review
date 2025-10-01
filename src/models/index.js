const Book = require("./Book.model");
const Review = require("./Review.model");
const User = require("./User.model");

Book.hasMany(Review, { foreignKey: "book_id", as: "Reviews" });
Review.belongsTo(Book, { foreignKey: "book_id", as: "Book" });

User.hasMany(Review, { foreignKey: "user_id", as: "Reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "User" });

module.exports = { Book, Review, User };

const Book = require("./Book.model");
const Review = require("./Review.model");
const User = require("./User.model");

Book.hasMany(Review, { foreignKey: "book_id", as: "Reviews" });
Review.belongsTo(Book, { foreignKey: "book_id", as: "Books" });

User.hasMany(Review, { foreignKey: "user_id", as: "Reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "Users" });

module.exports = { Book, Review, User };

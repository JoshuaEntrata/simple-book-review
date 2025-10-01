const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Book = sequelize.define(
  "Book",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Books",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Book;

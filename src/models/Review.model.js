const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Review = sequelize.define(
  "Review",
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
    },
    book_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Books",
        key: "id",
      },
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Review;

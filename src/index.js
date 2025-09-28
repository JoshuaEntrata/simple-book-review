require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

require("db");

const authRoutes = require("./routes/auth");
const bookRoutes = require("/routes/books");
const reviewsRoutes = require("./routes/reviews");

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || "Server error",
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

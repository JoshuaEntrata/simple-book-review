const { User } = require("../models");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/jwt");

const AuthService = {
  register: async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error("Username already taken");
    }

    const user = await User.create({
      password: hashedPassword,
      username,
    });
    const token = signToken(user);

    return { user, token };
  },

  login: async (username, password) => {
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      throw new Error("Invalid credentials username");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid credentials password");
    }

    const token = signToken(user);

    return { user, token };
  },
};

module.exports = AuthService;

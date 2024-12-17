const CustomError = require("../utils/CustomError");
const util = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtVerifyAsync = util.promisify(jwt.verify);
const jwtSignAsync = util.promisify(jwt.sign);
const { createUserSchema } = require("../utils/validation/users.validation");
require("dotenv").config();

class AuthController {
  userRepository;
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    const { error } = createUserSchema.validate(userData, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    const existingUser = await this.userRepository.getUserByEmail(
      userData.email
    );
    if (existingUser) throw new CustomError("Email already exists", 409);
    const user = await this.userRepository.createUser(userData);
    return user;
  }

  async login(userData) {
    const user = await this.userRepository.getUserByEmail(userData.email);
    if (!user) throw new CustomError("invalid email or password", 400);
    if (!userData.password) throw new CustomError("Password is required", 400);
    const isMatched = await bcrypt.compare(userData.password, user.password);
    if (isMatched) {
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user._id.toString());
      return { accessToken, refreshToken, user };
    } else {
      throw new CustomError("invalid email or password", 400);
    }
  }

  async logout(userId) {
    const user = await this.userRepository.updateUser(userId, {
      refreshToken: null,
    });
    return user;
  }

  async refreshAccessToken(incommingRefreshToken) {
    if (!incommingRefreshToken)
      throw new CustomError("Unauthorized, Refresh token is required", 401);
    const decodedToken = await jwtVerifyAsync(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await this.userRepository.getUserById(decodedToken?._id);
    if (!user || incommingRefreshToken !== user.refreshToken)
      throw new CustomError("Unauthorized, Invalid refresh token", 401);
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id.toString());
    return { accessToken, refreshToken, user };
  }

  async generateAccessToken(user) {
    const accessToken = await jwtSignAsync(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 60 * 15 }
    );
    return accessToken;
  }

  async generateRefreshToken(userId) {
    const refreshToken = await jwtSignAsync(
      {
        _id: userId,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    await this.userRepository.updateUser(userId, {
      refreshToken,
    });
    return refreshToken;
  }
}

module.exports = AuthController;

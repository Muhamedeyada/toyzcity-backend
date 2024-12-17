const CustomError = require("../utils/CustomError");
const bcrypt = require("bcrypt");
const { updateUserSchema } = require("../utils/validation/users.validation");

class UserController {
  userRepository;
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user;
  }

  async updateUser(id, newUserData) {
    const { error } = updateUserSchema.validate(newUserData, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }

    if (newUserData.password) {
      newUserData.password = await bcrypt.hash(newUserData.password, 10);
    }

    const user = await this.userRepository.updateUser(id, newUserData);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (id !== user._id.toString())
      throw new CustomError(
        "You do not have permission to update this data",
        403
      );
    return user;
  }
}

module.exports = UserController;

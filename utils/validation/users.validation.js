const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string()
    .required()
    .pattern(new RegExp("^(010|011|012|015)\\d{8}$"))
    .message("Invalid Egyptian phone number"),
  address: Joi.string().required(),
  role: Joi.string().valid("user", "admin").default("user"),
});

const updateUserSchema = createUserSchema
  .fork(["name", "email", "password", "phoneNumber", "address"], (schema) =>
    schema.optional()
  )
  .append({
    role: Joi.forbidden(),
    refreshToken: Joi.forbidden(),
  });

module.exports = {
  createUserSchema,
  updateUserSchema,
};

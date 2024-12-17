const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(500).required(),
  thumbnail: Joi.required(),
});

const updateCategorySchema = createCategorySchema.fork(
  ["name", "description", "thumbnail"],
  (schema) => schema.optional()
);

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};

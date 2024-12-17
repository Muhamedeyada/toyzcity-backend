const Joi = require("joi");
const mongoose = require("mongoose");

const validConditionNames = ["new", "gentle", "used"];
const validCategoryNames = [
  "Educational",
  "Action Figures & Dolls",
  "Outdoor & Sports",
  "Electronic & Interactive",
];

const createItemSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(500).required(),
  price: Joi.number().min(1).required(),
  condition: Joi.string()
    .valid(...validConditionNames)
    .required(),
  isAvailableForSwap: Joi.boolean().default(false),
  thumbnail: Joi.required(),
  category: Joi.string()
    .valid(...validCategoryNames)
    .required(),
  ownerId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "valid MongoDB ObjectId")
    .optional(),
});

const updateItemSchema = createItemSchema
  .fork(
    [
      "name",
      "price",
      "condition",
      "description",
      "category",
      "isAvailableForSwap",
      "thumbnail",
    ],
    (schema) => schema.optional()
  )
  .append({
    ownerId: Joi.forbidden(),
  });

module.exports = {
  createItemSchema,
  updateItemSchema,
};

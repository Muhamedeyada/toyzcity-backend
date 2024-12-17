const Joi = require("joi");

const contactUsSchema = Joi.object({
  fullName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  messageText: Joi.string().required().min(10).max(1000),
});

module.exports = {
  contactUsSchema,
};

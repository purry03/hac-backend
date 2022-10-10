const Joi = require('joi');

const createContainerSchema = Joi.object({
  image: Joi.string().alphanum().required(),
});

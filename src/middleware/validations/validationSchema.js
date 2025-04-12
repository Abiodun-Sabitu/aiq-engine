import Joi from "joi";

export const profileSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Invalid email format",
    "any.required": "Email is required",
  }),
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 30 characters",
    "any.required": "Username is required",
  }),
  avatar_url: Joi.string().uri().required().messages({
    "string.uri": "Avatar URL must be a valid URL",
    "any.required": "Avatar URL is required",
  }),
  country: Joi.string().required().messages({
    "string.base": "Country must be a string",
    "any.required": "Country is required",
  }),
  country_flag: Joi.string().optional(),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
});

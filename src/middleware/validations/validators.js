import { profileSchema, emailSchema } from "./validationSchema.js";

export const validateProfile = (req, res, next) => {
  const { error } = profileSchema.validate(req.body, { abortEarly: false }); // Validate all fields at once
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const validateEmail = (req, res, next) => {
  //console.log(req.body);
  const { error } = emailSchema.validate(req.body, { abortEarly: false }); //
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

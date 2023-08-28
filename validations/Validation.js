const { check } = require("express-validator");

exports.registerValidation = [
  check("username", "Username is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 8 characters long")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Password must contain at least one special character and one number"
    ),
];

exports.updateValidation = [
  check("email", "Please include a valid email").optional().isEmail(),
  check("password", "Password must be at least 8 characters long")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Password must contain at least one special character and one number"
    )
    .optional(),
];

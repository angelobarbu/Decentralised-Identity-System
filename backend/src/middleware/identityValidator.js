const { body, validationResult } = require("express-validator");

// Validation rules for identity issuance
const validateIdentity = [
  body("userAddress")
    .notEmpty().withMessage("User address is required.")
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage("Invalid Ethereum address."),

  body("firstName")
    .notEmpty().withMessage("First name is required.")
    .matches(/^[A-Za-z]+(([ '-][A-Za-z]+)*)$/).withMessage("Invalid first name format."),

  body("lastName")
    .notEmpty().withMessage("Last name is required.")
    .matches(/^[A-Za-z]+(([ '-][A-Za-z]+)*)$/).withMessage("Invalid last name format."),

  body("dob")
    .notEmpty().withMessage("Date of birth is required.")
    .isISO8601().withMessage("Invalid date format.")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        throw new Error("User must be at least 18 years old.");
      }
      return true;
    }),

  body("nationality")
    .notEmpty().withMessage("Nationality is required."),

  body("idNumber")
    .notEmpty().withMessage("ID number is required.")
    .matches(/^[a-zA-Z0-9]{5,20}$/).withMessage("ID number must be 5-20 alphanumeric characters."),

  // Error Handling Middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateIdentity };

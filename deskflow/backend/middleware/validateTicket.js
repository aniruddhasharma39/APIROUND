const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');

// --- Validation rules for creating a ticket ---
const ticketRules = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 150 })
    .withMessage('Subject cannot exceed 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('customerEmail')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Ticket.PRIORITY_LEVELS)
    .withMessage(`Priority must be one of: ${Ticket.PRIORITY_LEVELS.join(', ')}`),
];

// --- Middleware that runs after rules and returns errors if any ---
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all field errors as a flat object: { field: message }
    const formatted = {};
    errors.array().forEach((err) => {
      if (!formatted[err.path]) {
        formatted[err.path] = err.msg;
      }
    });
    return res.status(422).json({ errors: formatted });
  }
  next();
};

module.exports = { ticketRules, checkValidation };

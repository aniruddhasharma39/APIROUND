const mongoose = require('mongoose');

const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];
const STATUS_STATES = ['open', 'in_progress', 'resolved', 'closed'];

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: {
        values: PRIORITY_LEVELS,
        message: 'Priority must be one of: low, medium, high, urgent',
      },
      required: [true, 'Priority is required'],
    },

    status: {
      type: String,
      enum: {
        values: STATUS_STATES,
        message: 'Invalid status value',
      },
      default: 'open',
    },

    // Set automatically when status moves to 'resolved', cleared if moved back
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // createdAt and updatedAt handled by timestamps option
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Expose enum values so routes/utils can import them without re-declaring
ticketSchema.statics.PRIORITY_LEVELS = PRIORITY_LEVELS;
ticketSchema.statics.STATUS_STATES = STATUS_STATES;

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;

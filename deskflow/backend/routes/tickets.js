const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { ticketRules, checkValidation } = require('../middleware/validateTicket');
const { isTransitionAllowed } = require('../utils/transitions');
const { deriveFields } = require('../utils/deriveFields');

// Helper: attach derived fields to a ticket plain object
const withDerived = (ticket) => {
  const plain = ticket.toObject ? ticket.toObject() : { ...ticket };
  return { ...plain, ...deriveFields(ticket) };
};

// ─────────────────────────────────────────────
// POST /tickets — create a new ticket
// ─────────────────────────────────────────────
router.post('/', ticketRules, checkValidation, async (req, res, next) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const ticket = await Ticket.create({ subject, description, customerEmail, priority });
    res.status(201).json(withDerived(ticket));
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /tickets/stats — MUST be before /:id route
// Aggregates: count per status, count per priority, breached unresolved count
// ─────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [byStatus, byPriority, allOpen] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Ticket.find({ status: { $in: ['open', 'in_progress'] } }).lean(),
    ]);

    // Count unresolved tickets where age has exceeded SLA target
    const { SLA_TARGETS } = require('../utils/transitions');
    const now = Date.now();
    let breachedCount = 0;
    for (const t of allOpen) {
      const ageMin = Math.floor((now - new Date(t.createdAt).getTime()) / 60_000);
      const target = SLA_TARGETS[t.priority] ?? Infinity;
      if (ageMin > target) breachedCount++;
    }

    // Reshape arrays into plain objects for easier frontend consumption
    const statusCounts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const priorityCounts = Object.fromEntries(byPriority.map((p) => [p._id, p.count]));

    res.json({ statusCounts, priorityCounts, breachedCount });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /tickets — list with optional filters
// Query params: ?status=open &priority=high &breached=true (combinable)
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    let result = tickets.map(withDerived);

    // breached filter applied in-memory (needs derived field)
    if (breached === 'true') {
      result = result.filter((t) => t.slaBreached);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PATCH /tickets/:id — update status only
// Enforces transition rules, auto-manages resolvedAt
// ─────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const { status: nextStatus } = req.body;

    if (!nextStatus) {
      return res.status(400).json({ error: 'Request body must include a "status" field' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { allowed, reason } = isTransitionAllowed(ticket.status, nextStatus);
    if (!allowed) {
      return res.status(409).json({ error: reason });
    }

    ticket.status = nextStatus;

    // Auto-manage resolvedAt timestamp
    if (nextStatus === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (ticket.resolvedAt && nextStatus !== 'closed') {
      // Moving back from resolved clears the timestamp
      ticket.resolvedAt = null;
    }

    await ticket.save();
    res.json(withDerived(ticket));
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /tickets/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const { SLA_TARGETS } = require('./transitions');

/**
 * Computes derived display fields for a single ticket.
 *
 * @param {object} ticket - Mongoose document (or plain object with .toObject())
 * @returns {{ ageMinutes: number, slaBreached: boolean }}
 */
const deriveFields = (ticket) => {
  const t = ticket.toObject ? ticket.toObject() : ticket;

  const start = new Date(t.createdAt).getTime();
  const isResolved = t.status === 'resolved' || t.status === 'closed';

  // Age: use resolvedAt as endpoint for resolved/closed, else use now
  const end = isResolved && t.resolvedAt
    ? new Date(t.resolvedAt).getTime()
    : Date.now();

  const ageMinutes = Math.floor((end - start) / 60_000);

  // SLA target for this ticket's priority (fallback to Infinity if unknown)
  const target = SLA_TARGETS[t.priority] ?? Infinity;

  // Breached logic:
  //   - Unresolved: age has already exceeded target → true
  //   - Resolved/Closed: took longer than target to resolve → true
  const slaBreached = ageMinutes > target;

  return { ageMinutes, slaBreached };
};

module.exports = { deriveFields };

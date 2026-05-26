// Status pipeline — order matters, index = position in flow
const PIPELINE = ['open', 'in_progress', 'resolved', 'closed'];

// SLA response targets in minutes per priority level
const SLA_TARGETS = {
  urgent: 60,    // 1 hour
  high: 240,     // 4 hours
  medium: 1440,  // 24 hours
  low: 4320,     // 72 hours
};

/**
 * Checks whether a status transition is allowed.
 *
 * Rules:
 *   - Forward: one step at a time (open→in_progress, NOT open→resolved)
 *   - Backward: one step at a time (in_progress→open, NOT resolved→open)
 *   - Same status: not a valid transition
 *
 * @param {string} current  - current ticket status
 * @param {string} next     - desired new status
 * @returns {{ allowed: boolean, reason: string }}
 */
const isTransitionAllowed = (current, next) => {
  if (current === next) {
    return { allowed: false, reason: 'Ticket is already in that status' };
  }

  const fromIdx = PIPELINE.indexOf(current);
  const toIdx = PIPELINE.indexOf(next);

  if (fromIdx === -1 || toIdx === -1) {
    return { allowed: false, reason: 'Unknown status value' };
  }

  const diff = toIdx - fromIdx;

  if (diff === 1) {
    return { allowed: true, reason: null };  // one step forward
  }

  if (diff === -1) {
    return { allowed: true, reason: null };  // one step backward
  }

  // Skipping steps — not allowed
  const direction = diff > 0 ? 'forward' : 'backward';
  return {
    allowed: false,
    reason: `Cannot jump ${direction} from "${current}" to "${next}" — only one step at a time`,
  };
};

module.exports = { isTransitionAllowed, SLA_TARGETS, PIPELINE };

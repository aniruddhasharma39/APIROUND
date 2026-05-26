import { canMoveForward, canMoveBack, nextStatus, prevStatus, formatAge } from '../utils/transitions';
import styles from './TicketCard.module.css';

const PRIORITY_CLASS = { low: 'low', medium: 'medium', high: 'high', urgent: 'urgent' };

export default function TicketCard({ ticket, onMove, onDelete }) {
  const { _id, subject, priority, status, ageMinutes, slaBreached, customerEmail } = ticket;

  const handleForward = () => onMove(_id, nextStatus(status));
  const handleBack    = () => onMove(_id, prevStatus(status));

  return (
    <div className={`${styles.card} ${slaBreached ? styles.breached : ''}`}>
      {slaBreached && <div className={styles.slaBadge}>⚠ SLA Breached</div>}

      <div className={styles.header}>
        <span className={`${styles.priority} ${styles[PRIORITY_CLASS[priority]]}`}>
          {priority}
        </span>
        <span className={styles.age}>{formatAge(ageMinutes)}</span>
      </div>

      <h3 className={styles.subject}>{subject}</h3>
      <p className={styles.email}>{customerEmail}</p>

      <div className={styles.actions}>
        {canMoveBack(status) && (
          <button className={`${styles.btn} ${styles.back}`} onClick={handleBack}>
            ← Back
          </button>
        )}
        {canMoveForward(status) && (
          <button className={`${styles.btn} ${styles.forward}`} onClick={handleForward}>
            Forward →
          </button>
        )}
        <button className={`${styles.btn} ${styles.del}`} onClick={() => onDelete(_id)}>
          ✕
        </button>
      </div>
    </div>
  );
}

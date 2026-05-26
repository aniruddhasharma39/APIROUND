import TicketCard from './TicketCard';
import styles from './BoardView.module.css';

const COLUMNS = [
  { key: 'open',        label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved' },
  { key: 'closed',      label: 'Closed' },
];

export default function BoardView({ tickets, onMove, onDelete }) {
  return (
    <div className={styles.board}>
      {COLUMNS.map(({ key, label }) => {
        const col = tickets.filter((t) => t.status === key);
        return (
          <div key={key} className={styles.column}>
            <div className={`${styles.colHeader} ${styles[key]}`}>
              <span className={styles.colLabel}>{label}</span>
              <span className={styles.colCount}>{col.length}</span>
            </div>
            <div className={styles.colBody}>
              {col.length === 0 ? (
                <p className={styles.empty}>No tickets</p>
              ) : (
                col.map((t) => (
                  <TicketCard key={t._id} ticket={t} onMove={onMove} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

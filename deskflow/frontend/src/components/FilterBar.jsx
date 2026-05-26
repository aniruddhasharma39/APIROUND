import styles from './FilterBar.module.css';

const PRIORITIES = ['all', 'low', 'medium', 'high', 'urgent'];

export default function FilterBar({ filters, onChange, onNew }) {
  const handlePriority = (e) =>
    onChange({ ...filters, priority: e.target.value === 'all' ? '' : e.target.value });

  const handleBreached = (e) =>
    onChange({ ...filters, breached: e.target.checked });

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <label className={styles.label}>Priority</label>
        <select
          className={styles.select}
          value={filters.priority || 'all'}
          onChange={handlePriority}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={!!filters.breached}
            onChange={handleBreached}
            className={styles.checkbox}
          />
          SLA Breached only
        </label>
      </div>

      <button className={styles.newBtn} onClick={onNew}>
        + New Ticket
      </button>
    </div>
  );
}

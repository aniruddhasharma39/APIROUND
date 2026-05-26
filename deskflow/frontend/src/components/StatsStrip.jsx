import { useEffect, useState } from 'react';
import { fetchStats } from '../utils/api';
import styles from './StatsStrip.module.css';

const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

export default function StatsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className={styles.strip}><span className={styles.loading}>Loading stats…</span></div>;

  const { statusCounts = {}, breachedCount = 0 } = stats;

  return (
    <div className={styles.strip}>
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <div key={key} className={`${styles.pill} ${styles[key]}`}>
          <span className={styles.count}>{statusCounts[key] ?? 0}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
      <div className={`${styles.pill} ${styles.breached}`}>
        <span className={styles.count}>{breachedCount}</span>
        <span className={styles.label}>SLA Breached</span>
      </div>
    </div>
  );
}

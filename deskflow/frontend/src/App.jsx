import { useState, useEffect, useCallback } from 'react';
import { fetchTickets, updateTicketStatus, deleteTicket } from './utils/api';
import StatsStrip from './components/StatsStrip';
import FilterBar from './components/FilterBar';
import BoardView from './components/BoardView';
import CreateTicketForm from './components/CreateTicketForm';
import './index.css';
import styles from './App.module.css';

export default function App() {
  const [tickets, setTickets]   = useState([]);
  const [filters, setFilters]   = useState({ priority: '', breached: false });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statsKey, setStatsKey] = useState(0); // bump to re-fetch stats

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTickets(filters);
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleMove = async (id, newStatus) => {
    try {
      const updated = await updateTicketStatus(id, newStatus);
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setStatsKey((k) => k + 1);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not move ticket');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      setStatsKey((k) => k + 1);
    } catch {
      alert('Could not delete ticket');
    }
  };

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setStatsKey((k) => k + 1);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡</span>
          <span className={styles.name}>DeskFlow</span>
          <span className={styles.tag}>Support Triage</span>
        </div>
      </header>

      <StatsStrip key={statsKey} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onNew={() => setShowForm(true)}
      />

      <main className={styles.main}>
        {loading && <div className={styles.state}>Loading tickets…</div>}
        {error   && <div className={`${styles.state} ${styles.err}`}>{error}</div>}
        {!loading && !error && (
          <BoardView
            tickets={tickets}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        )}
      </main>

      {showForm && (
        <CreateTicketForm
          onCreated={handleCreated}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

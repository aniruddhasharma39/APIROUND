import { useState } from 'react';
import { createTicket } from '../utils/api';
import styles from './CreateTicketForm.module.css';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const EMPTY = { subject: '', description: '', customerEmail: '', priority: '' };

export default function CreateTicketForm({ onCreated, onClose }) {
  const [fields, setFields]   = useState(EMPTY);
  const [errs, setErrs]       = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setFields((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!fields.subject.trim())       e.subject       = 'Subject is required';
    if (!fields.description.trim())   e.description   = 'Description is required';
    if (!fields.customerEmail.trim()) e.customerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.customerEmail)) e.customerEmail = 'Enter a valid email';
    if (!fields.priority)             e.priority      = 'Pick a priority';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localErrs = validate();
    if (Object.keys(localErrs).length) return setErrs(localErrs);

    setLoading(true);
    try {
      const ticket = await createTicket(fields);
      onCreated(ticket);
      onClose();
    } catch (err) {
      const serverErrs = err.response?.data?.errors;
      if (serverErrs) setErrs(serverErrs);
      else setErrs({ subject: 'Something went wrong, try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h2 className={styles.title}>New Ticket</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.lbl}>Subject</label>
            <input
              className={`${styles.input} ${errs.subject ? styles.invalid : ''}`}
              value={fields.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={150}
            />
            {errs.subject && <span className={styles.err}>{errs.subject}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.lbl}>Description</label>
            <textarea
              className={`${styles.input} ${styles.textarea} ${errs.description ? styles.invalid : ''}`}
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What's happening in detail?"
              rows={4}
            />
            {errs.description && <span className={styles.err}>{errs.description}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.lbl}>Customer Email</label>
            <input
              type="email"
              className={`${styles.input} ${errs.customerEmail ? styles.invalid : ''}`}
              value={fields.customerEmail}
              onChange={(e) => set('customerEmail', e.target.value)}
              placeholder="customer@example.com"
            />
            {errs.customerEmail && <span className={styles.err}>{errs.customerEmail}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.lbl}>Priority</label>
            <div className={styles.priorities}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.prioBtn} ${styles[p]} ${fields.priority === p ? styles.selected : ''}`}
                  onClick={() => set('priority', p)}
                >
                  {p}
                </button>
              ))}
            </div>
            {errs.priority && <span className={styles.err}>{errs.priority}</span>}
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating…' : 'Create Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}

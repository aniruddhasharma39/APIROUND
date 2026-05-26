import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchTickets = (filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.breached) params.breached = 'true';
  return client.get('/tickets', { params }).then((r) => r.data);
};

export const createTicket = (data) =>
  client.post('/tickets', data).then((r) => r.data);

export const updateTicketStatus = (id, status) =>
  client.patch(`/tickets/${id}`, { status }).then((r) => r.data);

export const deleteTicket = (id) =>
  client.delete(`/tickets/${id}`).then((r) => r.data);

export const fetchStats = () =>
  client.get('/tickets/stats').then((r) => r.data);

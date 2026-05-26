// Mirrors the backend PIPELINE so frontend can compute valid transitions
const PIPELINE = ['open', 'in_progress', 'resolved', 'closed'];

export const canMoveForward = (status) => {
  const idx = PIPELINE.indexOf(status);
  return idx !== -1 && idx < PIPELINE.length - 1;
};

export const canMoveBack = (status) => {
  const idx = PIPELINE.indexOf(status);
  return idx > 0;
};

export const nextStatus = (status) => {
  const idx = PIPELINE.indexOf(status);
  return PIPELINE[idx + 1] ?? null;
};

export const prevStatus = (status) => {
  const idx = PIPELINE.indexOf(status);
  return PIPELINE[idx - 1] ?? null;
};

export const formatAge = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

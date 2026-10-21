/**
 * Formats an ISO timestamp or Date into a clean relative "time ago" string.
 * @param {string | number | Date} dateInput
 * @returns {string}
 */
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  const timeMs = date.getTime();
  if (Number.isNaN(timeMs)) return '—';

  const nowMs = Date.now();
  const diffSeconds = Math.max(0, Math.floor((nowMs - timeMs) / 1000));

  if (diffSeconds < 45) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} mins ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hr ago' : `${diffHours} hrs ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) {
    return diffWeeks === 1 ? '1 wk ago' : `${diffWeeks} wks ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 mo ago' : `${diffMonths} mos ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? '1 yr ago' : `${diffYears} yrs ago`;
};

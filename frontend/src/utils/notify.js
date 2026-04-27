import { toast } from 'react-toastify';
import { getApiErrorMessage } from './apiError';

const DEFAULTS = {
  autoClose: 2500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function toastSuccess(message, options) {
  if (!message) return;
  toast.success(message, { ...DEFAULTS, ...options });
}

export function toastError(message, options) {
  const msg = message || 'Something went wrong';
  toast.error(msg, { ...DEFAULTS, autoClose: 3500, ...options });
}

/**
 * Wrap a promise with consistent pending/success/error toasts.
 *
 * Example:
 *   await toastApiPromise(api.post('/teams', data), {
 *     pending: 'Creating team...',
 *     success: 'Team created',
 *   })
 */
export function toastApiPromise(promise, { pending, success, error } = {}) {
  return toast.promise(
    promise,
    {
      pending: pending || 'Working... ',
      success: success || 'Done',
      error: {
        render({ data }) {
          if (typeof error === 'function') return error(data);
          if (typeof error === 'string' && error.trim()) return error;
          return getApiErrorMessage(data);
        },
      },
    },
    DEFAULTS
  );
}

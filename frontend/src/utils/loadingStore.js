let pendingRequests = 0;
const listeners = new Set();

function emit() {
  for (const listener of listeners) {
    try {
      listener(pendingRequests);
    } catch {
      // ignore listener errors
    }
  }
}

export function getPendingRequests() {
  return pendingRequests;
}

export function incrementPendingRequests() {
  pendingRequests += 1;
  emit();
}

export function decrementPendingRequests() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emit();
}

export function subscribeToPendingRequests(listener) {
  listeners.add(listener);
  // fire immediately with current state
  listener(pendingRequests);
  return () => {
    listeners.delete(listener);
  };
}

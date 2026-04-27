export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong') {
  if (!error) return fallbackMessage;

  // Axios-style errors
  const axiosMessage = error?.response?.data?.message;
  if (typeof axiosMessage === 'string' && axiosMessage.trim()) return axiosMessage;

  // Fetch-style errors where caller throws { message }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;

  // Some APIs return `error` instead of `message`
  const alt = error?.response?.data?.error;
  if (typeof alt === 'string' && alt.trim()) return alt;

  return fallbackMessage;
}

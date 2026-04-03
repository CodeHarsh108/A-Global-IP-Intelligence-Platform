export const getErrorMessage = (error) => {
  if (error.response?.data) {
    // Backend returned structured error
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.error) return error.response.data.error;
    if (error.response.data.message) return error.response.data.message;
    return JSON.stringify(error.response.data);
  }
  if (error.message) return error.message;
  return "An unexpected error occurred";
};
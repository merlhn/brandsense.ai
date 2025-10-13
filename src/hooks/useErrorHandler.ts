import { useState } from 'react';

export interface ErrorState {
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorHandler = (): ErrorState => {
  const [error, setError] = useState('');
  
  const clearError = () => setError('');
  const hasError = error.length > 0;
  
  return {
    error,
    setError,
    clearError,
    hasError
  };
};

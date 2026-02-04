import { useState } from 'react';

// Define all possible states a transaction can be in
type TransactionState = 'idle' | 'preparing' | 'pending' | 'success' | 'error';

// Configuration options when creating the hook
interface UseTransactionFlowOptions {
  onSuccess?: (data?: any) => void; // Called when transaction succeeds (confirmed on blockchain)
  onError?: (error: Error) => void;   // Called when anything goes wrong
  successDuration?: number; // How long to show success state before resetting (milliseconds)
}

// What this hook returns to your component
interface UseTransactionFlowReturn {
  
  state: TransactionState; // Current state of the transaction
  
  // Convenience booleans (easier than checking state === 'preparing')
  isIdle: boolean;
  isLoading: boolean;      
  isPending: boolean;      
  isSuccess: boolean;
  isError: boolean;
  
  error: string | null; // Error message if something failed
  
  txHash: string | null; // Transaction hash (for Etherscan link)
  
  execute: (txFunction: () => Promise<any>) => Promise<void>; // The main function - call this to execute a transaction
  
  // Manually reset to idle state
  reset: () => void;
}


export function useTransactionFlow(
  options: UseTransactionFlowOptions = {}
): UseTransactionFlowReturn {
  
  // Destructure options with defaults
  const { 
    onSuccess, 
    onError, 
    successDuration = 3000  
  } = options;

  // STATE MANAGEMENT
  const [state, setState] = useState<TransactionState>('idle');
  
  // Store error message
  const [error, setError] = useState<string | null>(null);
  
  // Store transaction hash (to show Etherscan link)
  const [txHash, setTxHash] = useState<string | null>(null);


  const execute = async (txFunction: () => Promise<any>) => {
    try {
      // STEP 1: Clear any previous errors
      setError(null);
      setTxHash(null);
      
      // STEP 2: Enter preparing state (wallet confirmation)
      setState('preparing');
      
      // STEP 3: Execute the transaction function you passed in
      const result = await txFunction();
      
      // STEP 4: Transaction submitted! Now waiting for confirmation
      setState('pending');
      
      // If result has a hash (some wagmi hooks return this)
      if (result?.hash) {
        setTxHash(result.hash);
      }
      
      // STEP 5: For this demo, we'll assume success after the promise resolves
      setState('success');
      
      // STEP 6: Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      // STEP 7: Auto-reset to idle after success duration
      setTimeout(() => {
        setState('idle');
        setTxHash(null);
      }, successDuration);
      
    } catch (err) {
      // ERROR HANDLING
      
      // Check if user rejected the transaction (common case)
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      
      // User rejection is not really an "error" - they just cancelled
      if (errorMessage.includes('User rejected') || 
          errorMessage.includes('user rejected')) {
        console.log('User cancelled transaction');
        setState('idle'); // Just go back to idle
        return;
      }
      
      // Real error - show it
      setState('error');
      setError(errorMessage);
      
      // Call error callback if provided
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };


  const reset = () => {
    setState('idle');
    setError(null);
    setTxHash(null);
  };

  const isIdle = state === 'idle';
  const isLoading = state === 'preparing';
  const isPending = state === 'pending';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  return {
    state,
    isIdle,
    isLoading,
    isPending,
    isSuccess,
    isError,
    error,
    txHash,
    execute,
    reset,
  };
}

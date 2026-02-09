import LoadingSpinner from './LoadingSpinner';

// Transaction state from useTransactionFlow
export type TransactionState = 'idle' | 'preparing' | 'pending' | 'success' | 'error';

interface TransactionButtonProps {
    // REQUIRED PROPS
    onClick: () => void | Promise<void>;  // What happens when user clicks
    label: string;                         // Button text in idle state

    // STATE PROPS (unified - from useTransactionFlow)
    txState?: TransactionState;            // Current transaction state
    txHash?: string | null;                // Transaction hash for Etherscan link
    error?: string | null;                 // Error message to display

    // OPTIONAL TEXT OVERRIDES
    preparingText?: string;
    pendingText?: string;
    successText?: string;

    // STYLING PROPS
    variant?: 'primary' | 'success' | 'danger' | 'secondary';
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
}

export default function TransactionButton({
    onClick,
    label,
    txState = 'idle',
    txHash,
    error = null,
    preparingText = "Confirming in wallet...",
    pendingText = "Transaction pending...",
    successText = "Success!",
    variant = 'primary',
    disabled = false,
    className = '',
    fullWidth = false,
}: TransactionButtonProps) {

    // DETERMINE CURRENT TEXT based on state
    const getCurrentText = (): string => {
        switch (txState) {
            case 'preparing':
                return preparingText;
            case 'pending':
                return pendingText;
            case 'success':
                return successText;
            case 'error':
                return error || "Transaction Failed";
            default:
                return label;
        }
    };

    // Button should be disabled during any active state or custom disabled
    const isDisabled = txState !== 'idle' || disabled;

    // GET VARIANT STYLES - different colors for different states
    const getVariantStyles = (): string => {
        if (txState === 'success') {
            return 'bg-green-600 hover:bg-green-600 border-green-500';
        }

        if (txState === 'error') {
            return 'bg-red-600 hover:bg-red-500 border-red-500';
        }

        if (txState === 'preparing' || txState === 'pending') {
            return 'bg-slate-600 border-slate-600 cursor-wait';
        }

        const variants = {
            primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-blue-500',
            success: 'bg-green-600 hover:bg-green-500 border-green-500',
            danger: 'bg-red-600 hover:bg-red-500 border-red-500',
            secondary: 'bg-slate-700 hover:bg-slate-600 border-slate-600',
        };

        return variants[variant];
    };

    // GET ICON - show different icons based on state
    const getIcon = () => {
        if (txState === 'success') return <span className="text-xl">✅</span>;
        if (txState === 'error') return <span className="text-xl">❌</span>;
        if (txState === 'preparing' || txState === 'pending') return <LoadingSpinner size="sm" color="white" />;
        return null;
    };

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
        ${fullWidth ? 'w-full' : ''}
        px-6 py-3 
        ${getVariantStyles()}
        text-white font-semibold rounded-lg 
        transition-all duration-200 
        border
        disabled:cursor-not-allowed 
        disabled:opacity-70
        hover:scale-[1.02] 
        active:scale-[0.98]
        disabled:scale-100
        shadow-lg 
        hover:shadow-xl
        flex items-center justify-center gap-2
        ${className}
      `}
        >
            {getIcon()}
            <span>{getCurrentText()}</span>
        </button>
    );
}

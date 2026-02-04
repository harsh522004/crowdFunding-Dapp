import LoadingSpinner from './LoadingSpinner';

interface TransactionButtonProps {
    // REQUIRED PROPS
    onClick: () => void;           // What happens when user clicks

    // STATE PROPS (from useTransactionFlow)
    isLoading?: boolean;           // True when wallet is confirming
    isPending?: boolean;           // True when transaction is pending
    isSuccess?: boolean;           // True when transaction succeeded
    isError?: boolean;             // True when transaction failed
    error?: string | null;         // Error message to display

    // TEXT PROPS (customize for each use case)
    idleText: string;
    loadingText?: string;
    pendingText?: string;
    successText?: string;
    errorText?: string;

    // STYLING PROPS
    variant?: 'primary' | 'success' | 'danger' | 'secondary';
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
}

export default function TransactionButton({
    onClick,
    isLoading = false,
    isPending = false,
    isSuccess = false,
    isError = false,
    error = null,
    idleText,
    loadingText = "Confirming in wallet...",
    pendingText = "Transaction pending...",
    successText = "Success!",
    errorText,
    variant = 'primary',
    disabled = false,
    className = '',
    fullWidth = false,
}: TransactionButtonProps) {

    // DETERMINE CURRENT TEXT based on state
    const getCurrentText = (): string => {
        if (isSuccess) return successText;
        if (isError) return errorText || error || "Transaction Failed";
        if (isLoading) return loadingText;
        if (isPending) return pendingText;
        return idleText;
    };

    // Button should be disabled during loading, pending, success, or custom disabled
    const isDisabled = isLoading || isPending || isSuccess || disabled;

    // GET VARIANT STYLES - different colors for different states
    const getVariantStyles = (): string => {
        if (isSuccess) {
            return 'bg-green-600 hover:bg-green-600 border-green-500';
        }

        if (isError) {
            return 'bg-red-600 hover:bg-red-500 border-red-500';
        }

        if (isLoading || isPending) {
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
        if (isSuccess) return <span className="text-xl">✅</span>;
        if (isError) return <span className="text-xl">❌</span>;
        if (isLoading || isPending) return <LoadingSpinner size="sm" color="white" />;
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

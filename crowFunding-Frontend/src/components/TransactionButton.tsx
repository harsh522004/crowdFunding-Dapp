// one Transaction button for contract transactions which aceept props : onClick handler, label, disabled
import React from 'react';
interface TransactionButtonProps {
    onClick: () => Promise<void>;
    label: string;
    disabled?: boolean;
}
export const TransactionButton: React.FC<TransactionButtonProps> = ({ onClick, label, disabled = false }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const handleClick = async () => {
        setIsProcessing(true);
        try {
            await onClick();
        } catch (error) {
            console.error("Transaction failed:", error);
        }
        setIsProcessing(false);
    }
    return (
        <button
            onClick={handleClick}
            disabled={disabled || isProcessing}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {isProcessing ? 'Processing...' : label}
        </button>
    );
}

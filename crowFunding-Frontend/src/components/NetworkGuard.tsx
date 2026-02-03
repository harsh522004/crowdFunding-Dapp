import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { SEPOLIA_CHAIN_ID } from '../contracts/config';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { isConnected } = useAccount();

    // Only show warning if connected and wrong network
    if (isConnected && chainId !== SEPOLIA_CHAIN_ID) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
                    <h3 className="text-red-400 text-xl font-bold mb-2">⚠️ Wrong Network</h3>
                    <p className="text-slate-300 mb-4">
                        Please switch to Sepolia testnet to use this app
                    </p>
                    <button
                        onClick={() => switchChain?.({ chainId: SEPOLIA_CHAIN_ID })}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                    >
                        Switch to Sepolia
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
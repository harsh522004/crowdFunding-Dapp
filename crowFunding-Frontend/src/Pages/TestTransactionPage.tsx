/**
 * TEST PAGE FOR TRANSACTION PATTERN
 * 
 * This page demonstrates how useTransactionFlow + TransactionButton work together.
 * You can test all transaction states without actually sending blockchain transactions.
 * 
 * PURPOSE:
 * - See how states transition: Idle → Loading → Pending → Success
 * - Test error handling
 * - Understand the pattern before using it with real transactions
 * 
 * HOW TO USE:
 * 1. Add this route to your App.tsx: <Route path="/test-tx" element={<TestTransactionPage />} />
 * 2. Navigate to /test-tx in your browser
 * 3. Click the buttons to see different scenarios
 * 4. Watch the console for logs
 * 5. Once you understand the pattern, DELETE THIS FILE
 */

import { useState } from 'react';
import { useTransactionFlow } from '../features/campaigns/hooks';
import TransactionButton from '../components/TransactionButton';

export default function TestTransactionPage() {
    const [log, setLog] = useState<string[]>([]);

    // Add message to log (for visual feedback)
    const addLog = (message: string) => {
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
        console.log(message);
    };

    /**
     * TEST 1: Successful Transaction
     * 
     * Simulates a normal transaction flow:
     * - Instant wallet confirmation (no delay)
     * - 2 second "blockchain confirmation" (simulated with setTimeout)
     * - Success!
     */
    const successTx = useTransactionFlow({
        onSuccess: () => {
            addLog('✅ Success callback executed!');
        },
        onError: (error) => {
            addLog(`❌ Error callback: ${error.message}`);
        }
    });

    const handleSuccessTest = () => {
        successTx.execute(async () => {
            addLog('🔵 Transaction function executing...');

            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            addLog('🟢 Transaction confirmed on blockchain!');

            return { hash: '0x123...abc' }; // Simulated tx hash
        });
    };

    /**
     * TEST 2: Failed Transaction
     * 
     * Simulates an error (e.g., contract revert, insufficient balance)
     */
    const errorTx = useTransactionFlow({
        onError: (error) => {
            addLog(`❌ Error caught: ${error.message}`);
        }
    });

    const handleErrorTest = () => {
        errorTx.execute(async () => {
            addLog('🔵 Starting transaction...');

            // Simulate some delay before error
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Throw an error
            throw new Error('Execution reverted: insufficient balance');
        });
    };

    /**
     * TEST 3: User Rejection
     * 
     * Simulates user clicking "Reject" in MetaMask
     * This should NOT show an error - just reset to idle
     */
    const rejectionTx = useTransactionFlow({
        onError: () => {
            addLog('❌ This should NOT be called on user rejection!');
        }
    });

    const handleRejectionTest = () => {
        rejectionTx.execute(async () => {
            addLog('🔵 Asking user to confirm...');

            await new Promise(resolve => setTimeout(resolve, 500));

            // User rejected - special error message
            throw new Error('User rejected the request');
        });
    };

    /**
     * TEST 4: Real Transaction Pattern
     * 
     * This shows how you'd use it with actual wagmi hooks.
     * (Commented out because you don't have real contract yet)
     */
    const realTx = useTransactionFlow({
        onSuccess: (data) => {
            addLog('✅ Campaign created!');
            addLog(`📍 New campaign address: ${data?.campaignAddress}`);
            // In real code: navigate(`/campaign/${data.campaignAddress}`);
        }
    });

    const handleRealExample = () => {
        // This is how you'd use it for real:
        /*
        realTx.execute(async () => {
          // 1. Call wagmi's writeContract
          const result = await writeContract({
            address: CONTRACTS.factory,
            abi: factoryABI,
            functionName: 'createClone',
            args: [parseEther('1'), 2592000, 100]
          });
          
          // 2. Wait for confirmation
          const receipt = await waitForTransaction({ hash: result.hash });
          
          // 3. Parse event to get new campaign address
          const event = parseEventLog({
            abi: factoryABI,
            logs: receipt.logs,
            eventName: 'CampaignCreated'
          });
          
          return { 
            hash: result.hash,
            campaignAddress: event.args.campaign 
          };
        });
        */

        // For now, just simulate it:
        realTx.execute(async () => {
            addLog('🔵 [SIMULATED] Calling factory.createClone()...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            addLog('🟡 [SIMULATED] Transaction pending...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            addLog('🟢 [SIMULATED] Transaction confirmed!');
            return { campaignAddress: '0xNew...Campaign' };
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🧪 Transaction Pattern Test Lab
                    </h1>
                    <p className="text-slate-400">
                        Test all transaction states without sending real transactions.
                        Check console and logs below.
                    </p>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Test 1: Success */}
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-white font-semibold mb-2">Test 1: Success Flow</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Simulates successful transaction with 2s delay
                        </p>
                        <TransactionButton
                            onClick={handleSuccessTest}
                            isLoading={successTx.isLoading}
                            isPending={successTx.isPending}
                            isSuccess={successTx.isSuccess}
                            isError={successTx.isError}
                            error={successTx.error}
                            idleText="Test Success"
                            loadingText="Confirming..."
                            pendingText="Pending (2s)..."
                            successText="Success! ✨"
                            fullWidth
                        />
                        <div className="mt-3 text-xs text-slate-500">
                            State: {successTx.state}
                        </div>
                    </div>

                    {/* Test 2: Error */}
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-white font-semibold mb-2">Test 2: Error Handling</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Simulates transaction failure
                        </p>
                        <TransactionButton
                            onClick={handleErrorTest}
                            isLoading={errorTx.isLoading}
                            isPending={errorTx.isPending}
                            isSuccess={errorTx.isSuccess}
                            isError={errorTx.isError}
                            error={errorTx.error}
                            idleText="Test Error"
                            fullWidth
                            variant="danger"
                        />
                        <div className="mt-3 text-xs text-slate-500">
                            State: {errorTx.state}
                        </div>
                        {errorTx.error && (
                            <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                                {errorTx.error}
                            </div>
                        )}
                    </div>

                    {/* Test 3: User Rejection */}
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-white font-semibold mb-2">Test 3: User Rejection</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Simulates user clicking "Reject" in wallet
                        </p>
                        <TransactionButton
                            onClick={handleRejectionTest}
                            isLoading={rejectionTx.isLoading}
                            isPending={rejectionTx.isPending}
                            isSuccess={rejectionTx.isSuccess}
                            isError={rejectionTx.isError}
                            error={rejectionTx.error}
                            idleText="Test Rejection"
                            fullWidth
                            variant="secondary"
                        />
                        <div className="mt-3 text-xs text-slate-500">
                            State: {rejectionTx.state}
                        </div>
                    </div>

                    {/* Test 4: Real Pattern */}
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-white font-semibold mb-2">Test 4: Real Usage Pattern</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Simulates how you'll use it for actual transactions
                        </p>
                        <TransactionButton
                            onClick={handleRealExample}
                            isLoading={realTx.isLoading}
                            isPending={realTx.isPending}
                            isSuccess={realTx.isSuccess}
                            isError={realTx.isError}
                            error={realTx.error}
                            idleText="Create Campaign (Simulated)"
                            loadingText="Confirming in wallet..."
                            pendingText="Creating campaign..."
                            successText="Campaign Created! 🎉"
                            fullWidth
                        />
                        <div className="mt-3 text-xs text-slate-500">
                            State: {realTx.state}
                        </div>
                    </div>
                </div>

                {/* Event Log */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-white font-semibold mb-4">Event Log</h3>
                    <div className="bg-slate-900 rounded p-4 h-64 overflow-y-auto font-mono text-xs">
                        {log.length === 0 ? (
                            <div className="text-slate-500 italic">
                                Click a button above to see events...
                            </div>
                        ) : (
                            log.map((entry, index) => (
                                <div key={index} className="text-slate-300 mb-1">
                                    {entry}
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => setLog([])}
                        className="mt-3 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        Clear Log
                    </button>
                </div>

                {/* Usage Example Code */}
                <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-white font-semibold mb-4">📖 How to Use in Your Components</h3>
                    <pre className="bg-slate-900 rounded p-4 overflow-x-auto text-xs text-slate-300">
                        {`// In CreateCampaignPage.tsx
const tx = useTransactionFlow({
  onSuccess: (data) => {
    toast.success("Campaign created!");
    navigate(\`/campaign/\${data.campaignAddress}\`);
  }
});

const handleCreate = () => {
  tx.execute(async () => {
    const result = await writeContract({
      address: CONTRACTS.factory,
      functionName: "createClone",
      args: [goal, duration, rewardRate]
    });
    return result;
  });
};

return (
  <TransactionButton
    onClick={handleCreate}
    isLoading={tx.isLoading}
    isPending={tx.isPending}
    isSuccess={tx.isSuccess}
    isError={tx.isError}
    error={tx.error}
    idleText="Create Campaign"
    fullWidth
  />
);`}
                    </pre>
                </div>

                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                        💡 <strong>Next Steps:</strong> Once you understand this pattern, you can:
                        <br />1. Use it in CreateCampaignPage (Step 5.2)
                        <br />2. Use it in CampaignDetailPage for Contribute (Step 5.4)
                        <br />3. Use it everywhere else (Steps 5.5-5.7)
                        <br />4. DELETE this test page - it's just for learning!
                    </p>
                </div>
            </div>
        </div>
    );
}

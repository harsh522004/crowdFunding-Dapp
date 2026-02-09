# 🔄 Consistent Transaction Pattern Guide

## ✅ Correct Pattern for Blockchain Transactions

**Important:** For blockchain transactions, we use **wagmi's built-in state management** directly, NOT `useTransactionFlow`.

`useTransactionFlow` was designed for simple async operations. Blockchain transactions already have state management through wagmi hooks.

### **The Correct 2-Layer Pattern:**

```
Layer 1: useCreateCampaign (Business Logic with wagmi)
         ↓ maps wagmi states to txState
Layer 2: TransactionButton (UI)
         ↓ displays current state
```

---

## 📦 Correct Implementation

### **Step 1: Create Transaction Hook (e.g., useCreateCampaign.ts)**

```typescript
import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Address } from "viem";
import type { TransactionState } from "../../../components/TransactionButton";
import { CONTRACTS } from "../../../contracts/config";
import { factoryABI } from "../../../contracts/ABI/FactoryABI";

export type CreateCampaignInput = {
  goalInEth: string;
  durationInDays: string;
  tokensPerEth: string;
}

export function useCreateCampaign() {
    const [newCampaignAddress, setNewCampaignAddress] = useState<Address | null>(null);

    // Step 1: Get wagmi hooks
    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Step 2: Create transaction function
    const createCampaign = (inputData: CreateCampaignInput) => {
        // Convert form data to blockchain units
        const goalInWei = parseEther(inputData.goalInEth);
        const durationInSeconds = BigInt(Number(inputData.durationInDays) * 24 * 60 * 60);
        const tokensPerEth = BigInt(inputData.tokensPerEth);
        
        // Call contract
        writeContract({
            address: CONTRACTS.factory as Address,
            abi: factoryABI,
            functionName: "createClone",
            args: [goalInWei, durationInSeconds, tokensPerEth],
        });
    };

    // Step 3: Parse event after success (if needed)
    useEffect(() => {
        if (isSuccess && receipt) {
            // Parse CampaignCreated event to get new campaign address
            const campaignLog = receipt.logs.find((log) => {
                try {
                    const decoded = decodeEventLog({
                        abi: factoryABI,
                        data: log.data,
                        topics: log.topics,
                    });
                    return decoded.eventName === "CampaignCreated";
                } catch {
                    return false;
                }
            });

            if (campaignLog) {
                const decoded = decodeEventLog({
                    abi: factoryABI,
                    data: campaignLog.data,
                    topics: campaignLog.topics,
                });
                setNewCampaignAddress(decoded.args.campaign as Address);
            }
        }
    }, [isSuccess, receipt]);

    // Step 4: Map wagmi states to TransactionButton's expected state
    const getTxState = (): TransactionState => {
        if (isSuccess) return 'success';
        if (writeError) return 'error';
        if (isConfirming) return 'pending';      // Waiting for blockchain confirmation
        if (isPending) return 'preparing';        // Waiting for wallet confirmation
        return 'idle';
    };

    // Step 5: Return clean API
    return {
        createCampaign,
        newCampaignAddress,
        txState: getTxState(),
        txHash,
        error: writeError?.message,
        isSuccess,  // For refetching in useEffect
    };
}
```

---

## 🔍 Transaction States Explained

| State | When | Button Text | Button Color | User Can Click? |
|-------|------|-------------|--------------|-----------------|
| `idle` | Default/Ready | "Create Campaign" | Blue (primary) | ✅ Yes |
| `preparing` | Wallet confirming | "Confirming in wallet..." | Gray | ❌ No |
| `pending` | Transaction submitted | "Transaction pending..." | Gray | ❌ No |
| `success` | Confirmed on-chain | "Success!" | Green | ❌ No (auto-resets) |
| `error` | Something failed | Error message | Red | ✅ Yes (can retry) |

---

## ✅ Sepolia Configuration Verified

Your network setup is correct:

```typescript
// wagmiConfig.ts ✅
chains: [sepolia]  // Only Sepolia (testnet)

// config.ts ✅
Factory: 0x855B7277Aa2647306688D704EBF1F08106e3FBf2
Master:  0xf6857C98955eA82e2FdA1156dc0FC88511616757
Token:   0x24C0eD3AcA711BEB8EA95A35Ce9268b3e1A655dC
Chain ID: 11155111 (Sepolia)
```

**All transactions will execute on Sepolia Testnet** 🎉

---

## 🧪 Testing Your Implementation

1. **Connect Wallet**
   - Make sure you're on Sepolia network
   - Have some Sepolia ETH ([get from faucet](https://sepoliafaucet.com))

2. **Create Campaign**
   - Fill form with valid data
   - Click "Create Campaign"
   - Watch button states:
     - "Confirming in wallet..." → Approve in MetaMask
     - "Transaction pending..." → Wait for blockchain
     - "Success!" → Auto-redirect to campaign page

3. **Check Console**
   - Should see: "Campaign creation successful!" (from onSuccess callback)
   - Should NOT see any errors

4. **Verify on Etherscan**
   - Click the hash link during "pending" state
   - Opens [Sepolia Etherscan](https://sepolia.etherscan.io)
   - Verify transaction details

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module useTransactionFlow"
**Solution:** Check import path in useCreateCampaign.ts
```typescript
// Should be:
import { useTransactionFlow } from './useTransactionFlow';
// NOT from '../hooks/useTransactionFlow'
```

### Issue 2: Button stays in "preparing" forever
**Cause:** User cancelled but useTransactionFlow handles this
**Solution:** Already handled - button returns to idle if user rejects

### Issue 3: Event parsing fails
**Check:** Event name in contract must match exactly
```typescript
// Your contract emits: "CampaignCreated" (with capital C)
decoded.eventName === "CampaignCreated"  // ✅ Correct
```

### Issue 4: Wrong network
**Solution:** wagmi will auto-prompt user to switch to Sepolia
```typescript
// In wagmiConfig.ts - only Sepolia is allowed
chains: [sepolia]  // User must be on Sepolia
```

---

## 📚 Next Steps

Now that you have a consistent pattern:

1. **✅ Complete** - Create Campaign (Step 5.2)
2. **🔜 Next** - Token Approval (Step 5.3) - Use same pattern
3. **🔜 Next** - Contribute (Step 5.4) - Use same pattern
4. **🔜 Next** - Finalize (Step 5.5) - Use same pattern
5. **🔜 Next** - Withdraw (Step 5.6) - Use same pattern
6. **🔜 Next** - Refund (Step 5.7) - Use same pattern

**For each step:**
1. Copy the hook template above
2. Change function name and args
3. Update contract call
4. Use the same TransactionButton in your page

---

## 💡 Key Benefits of This Pattern

✅ **Consistent** - Same pattern everywhere\
✅ **Reusable** - useTransactionFlow handles all state management\
✅ **Clean** - Components only care about: txState, txHash, error\
✅ **Testable** - Each layer can be tested independently\
✅ **Maintainable** - Change state logic once, affects all transactions\
✅ **User-Friendly** - Clear feedback at every step

---

**You're now ready to implement the remaining transactions with confidence!** 🚀

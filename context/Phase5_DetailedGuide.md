# ✍️ Phase 5: Writing Transactions - Detailed Guide

**Duration:** 2-3 weeks (this is the CORE phase)\
**Goal:** Execute all contract interactions: create, contribute, finalize, withdraw, refund

**Success Criteria:**
- All write operations work end-to-end
- Users receive clear feedback at every step
- Errors are handled gracefully with actionable messages
- State management is consistent and predictable

---

## 📋 **What You Already Have (From Phase 4)**

Before starting Phase 5, you have:
- ✅ Frontend pages structure (HomePage, CreateCampaignPage, MyCampaignsPage, CampaignDetailPage)
- ✅ Contract reading functionality (campaign list, details, user contributions)
- ✅ Proper type system (CampaignDetailsRaw, CampaignDetailsUI)
- ✅ Data mapping layer (transforming blockchain data to UI)
- ✅ Wallet connection (wagmi + RainbowKit)
- ✅ Network configuration (Sepolia testnet)

**What Phase 5 adds:**
- 🔨 Write operations (transactions)
- 💾 State management during async operations
- ⚠️ Error handling and user feedback
- 🔄 Data refetching and cache invalidation
- ✅ Success confirmations

---

## 🔗 **Your Contract Architecture (Critical for Phase 5)**

### **Factory Contract Functions (You'll Call):**

```
createClone(goal, durationSeconds, tokensPerEth)
├─ What it does: Deploys a new campaign instance
├─ Who can call: Anyone
├─ Returns: Nothing (but emits CampaignCreated event)
├─ Important: No token approval needed from caller
└─ Gas cost: ~150k-200k gas
```

**Factory Admin (Only for token distribution):**
```
adminAddress → Returns address of factory deployer
token.approve(factoryAddress, amount) → ERC20 function
└─ Only factory admin needs to do this
└─ Once per setup (not per campaign)
```

---

### **Master Contract Functions (You'll Call):**

```
contribute()  [payable]
├─ What it does: User sends ETH, receives token reward
├─ Called by: Anyone except campaign creator
├─ Preconditions:
│  ├─ Campaign state = Funding
│  ├─ msg.value > 0
│  ├─ Deadline not passed
│  └─ Creator must have approved factory for tokens
├─ What happens:
│  ├─ ETH is held in contract
│  ├─ Factory.distributeTokens() is called
│  ├─ User's contribution is recorded
│  ├─ Campaign state auto-changes to Successful if goal reached
│  └─ Contributed event is emitted
└─ Gas cost: ~80k-120k gas
```

```
finalize()
├─ What it does: Manually sets campaign state to Successful/Failed
├─ Called by: Anyone (usually by creator or frontend)
├─ Preconditions:
│  └─ Deadline must have passed
├─ What happens:
│  ├─ If totalRaised >= goal → state = Successful
│  └─ If totalRaised < goal → state = Failed
├─ Notes:
│  ├─ Optional if goal is reached (auto-finalizes on contribute)
│  └─ Required if goal not reached (to set Failed state)
└─ Gas cost: ~30k-40k gas
```

```
withdraw()  [payable]
├─ What it does: Creator withdraws all ETH collected
├─ Called by: Campaign creator only
├─ Preconditions:
│  ├─ msg.sender == campaign creator
│  ├─ Campaign state = Successful
│  └─ Not already withdrawn
├─ What happens:
│  ├─ All ETH sent to creator
│  ├─ Campaign state changes to Withdrawn
│  └─ Withdrawn event is emitted
└─ Gas cost: ~25k-35k gas
```

```
refund()  [payable]
├─ What it does: Contributor gets ETH back if campaign failed
├─ Called by: Contributors who have positive balance
├─ Preconditions:
│  ├─ Campaign state = Failed
│  ├─ User has contributed (contribution > 0)
│  └─ User can only refund their own amount
├─ What happens:
│  ├─ User's contribution set to 0
│  ├─ User receives their ETH
│  └─ Refund event is emitted
├─ Notes:
│  └─ Tokens are NOT returned (they're the reward for trying)
└─ Gas cost: ~25k-35k gas
```

---

## 🎯 **Phase 5 Steps Breakdown**

### **Step 5.1: Transaction Button Pattern** ✅

**Duration:** 1 session\
**Goal:** Create a reusable component for all transaction flows

#### **Why This Matters**
All transactions follow this flow:
1. User clicks button
2. Wallet opens for confirmation
3. Transaction is pending (waiting for inclusion in block)
4. Transaction is confirmed
5. Data needs to be refreshed

**Before Phase 5**, every transaction would need this logic copied. **Step 5.1** creates a reusable pattern.

#### **Understanding Transaction States**

```
[Idle/Ready] → User clicks button
     ↓
[Preparing] → Getting gas estimate, wallet confirming
     ↓
[Pending] → Transaction submitted, waiting for confirmation
     ↓
[Success] → Transaction confirmed, show checkmark
     ↓
[Error] → Something failed, show error message

AND after Success:
     ↓
[Refetching] → Update UI with new data from contract
```

#### **✅ COMPLETED - Step 5.1 Implementation**

**Files Created:**
- ✅ `src/hooks/useTransactionFlow.ts` - State management hook
- ✅ `src/components/TransactionButton.tsx` - Visual component
- ✅ `src/Pages/TestTransactionPage.tsx` - Interactive demo

**Pattern Established:**
```typescript
// How to use in any page:
const txFlow = useTransactionFlow();

<TransactionButton
  onClick={async () => {
    await someAsyncAction();
  }}
  label="Do Something"
  txState={txFlow.state}
  txHash={txFlow.hash}
/>
```

**Testing Complete:**
- ✅ Button shows "Confirming..." state
- ✅ Shows success message with checkmark
- ✅ Re-disables after success
- ✅ Handles errors gracefully
- ✅ Test page demonstrates all scenarios

**What You Learned:**
- State machine pattern for async operations
- Proper TypeScript typing for transaction states
- Component reusability principles

**Next Steps:** Apply this pattern to real blockchain transactions (Steps 5.2-5.7)

---

### **Step 5.2: Create Campaign Transaction**

**Duration:** 2 sessions\
**Goal:** Let users create campaigns on-chain

#### **Understanding Campaign Creation Flow**

```
User fills form → User clicks "Create"
     ↓
Convert form values to blockchain units:
├─ Goal: "1 ETH" (string) → 1000000000000000000 (wei/bigint)
├─ Duration: "30 days" (string) → 2592000 (seconds)
├─ Reward Rate: "100 tokens" (string) → 100 (bigint)
└─ All validation happens
     ↓
Send transaction to Factory.createClone(goal, durationSeconds, tokensPerEth)
     ↓
User confirms in wallet
     ↓
Transaction pending → Show tx hash to user
     ↓
Wait for confirmation
     ↓
Parse CampaignCreated event from transaction receipt
├─ Event gives you: campaign address, creator, goal, deadline
└─ You need: campaign address
     ↓
Redirect to `/campaign/{newCampaignAddress}`
     ↓
Show success message: "Campaign created! Welcome to your new campaign"
```

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files You'll Modify:**
- 📝 `src/Pages/CreateCampaignPage.tsx` (add transaction logic)

**New Files to Create:**
- ✨ `src/features/campaigns/hooks/useCreateCampaign.ts` (transaction hook)

---

#### **📦 Step-by-Step: Create the Hook**

**File:** `src/features/campaigns/hooks/useCreateCampaign.ts`

**What this file does:** Handles the createClone transaction and event parsing

**Imports you need:**
```typescript
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog, type Address } from 'viem';
import { FACTORY_ADDRESS } from '../../../contracts/config';
import { factoryABI } from '../../../contracts/ABI/FactoryABI';
```

**Step 1: Define Input Type**
```typescript
// What data comes from the form
export type CreateCampaignInput = {
  goalInEth: string;        // "1.5"
  durationInDays: number;   // 30
  tokensPerEth: string;     // "100"
};
```

**Step 2: Define Hook Structure**
```typescript
export function useCreateCampaign() {
  const [newCampaignAddress, setNewCampaignAddress] = useState<Address | null>(null);
  
  // Step 2a: Get wagmi hooks
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Step 2b: Create the main function
  const createCampaign = async (input: CreateCampaignInput) => {
    // TODO: Add logic here
  };

  // Step 2c: Return everything the component needs
  return {
    createCampaign,
    isPending,           // Waiting for user to confirm in wallet
    isConfirming,        // Transaction submitted, waiting for blockchain
    isSuccess,           // Transaction confirmed
    txHash,              // Transaction hash (for Etherscan link)
    newCampaignAddress,  // Parsed from event
    error: writeError,
  };
}
```

**Step 3: Implement createCampaign Function**

Inside the `createCampaign` function, add this logic:

```typescript
const createCampaign = async (input: CreateCampaignInput) => {
  // 3a: Convert form data to blockchain units
  const goalWei = parseEther(input.goalInEth);           // "1.5" → 1500000000000000000n
  const durationSeconds = BigInt(input.durationInDays * 24 * 60 * 60);  // 30 days → 2592000n
  const rewardRate = BigInt(input.tokensPerEth);         // "100" → 100n

  // 3b: Call the contract
  writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'createClone',
    args: [goalWei, durationSeconds, rewardRate],
  });
};
```

**Step 4: Parse Event After Transaction Confirms**

Add a `useEffect` that runs when transaction succeeds:

```typescript
import { useEffect } from 'react';

// Add this INSIDE the useCreateCampaign function, after the writeContract declaration
useEffect(() => {
  if (isSuccess && receipt) {
    // 4a: Find the CampaignCreated event in logs
    const campaignCreatedLog = receipt.logs.find((log) => {
      try {
        const decoded = decodeEventLog({
          abi: factoryABI,
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === 'CampaignCreated';
      } catch {
        return false;
      }
    });

    // 4b: Extract campaign address from event
    if (campaignCreatedLog) {
      const decoded = decodeEventLog({
        abi: factoryABI,
        data: campaignCreatedLog.data,
        topics: campaignCreatedLog.topics,
      });
      
      // Event signature: CampaignCreated(address campaign, address creator, uint256 goal, uint256 deadline)
      const campaignAddress = decoded.args.campaign as Address;
      setNewCampaignAddress(campaignAddress);
    }
  }
}, [isSuccess, receipt]);
```

**Complete Hook File Structure:**
```typescript
// src/features/campaigns/hooks/useCreateCampaign.ts
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog, type Address } from 'viem';
import { FACTORY_ADDRESS } from '../../../contracts/config';
import { factoryABI } from '../../../contracts/ABI/FactoryABI';

export type CreateCampaignInput = {
  goalInEth: string;
  durationInDays: number;
  tokensPerEth: string;
};

export function useCreateCampaign() {
  const [newCampaignAddress, setNewCampaignAddress] = useState<Address | null>(null);
  
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const createCampaign = async (input: CreateCampaignInput) => {
    const goalWei = parseEther(input.goalInEth);
    const durationSeconds = BigInt(input.durationInDays * 24 * 60 * 60);
    const rewardRate = BigInt(input.tokensPerEth);

    writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryABI,
      functionName: 'createClone',
      args: [goalWei, durationSeconds, rewardRate],
    });
  };

  useEffect(() => {
    if (isSuccess && receipt) {
      const campaignCreatedLog = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: factoryABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === 'CampaignCreated';
        } catch {
          return false;
        }
      });

      if (campaignCreatedLog) {
        const decoded = decodeEventLog({
          abi: factoryABI,
          data: campaignCreatedLog.data,
          topics: campaignCreatedLog.topics,
        });
        setNewCampaignAddress(decoded.args.campaign as Address);
      }
    }
  }, [isSuccess, receipt]);

  return {
    createCampaign,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    newCampaignAddress,
    error: writeError,
  };
}
```

---

#### **🎨 Step-by-Step: Integrate into CreateCampaignPage**

**File:** `src/Pages/CreateCampaignPage.tsx`

**Step 1: Import the Hook**
```typescript
import { useCreateCampaign } from '../features/campaigns/hooks/useCreateCampaign';
import { TransactionButton } from '../components/TransactionButton';
import { useNavigate } from 'react-router-dom';
```

**Step 2: Use the Hook in Component**
```typescript
function CreateCampaignPage() {
  const navigate = useNavigate();
  const { createCampaign, isPending, isConfirming, isSuccess, txHash, newCampaignAddress, error } = useCreateCampaign();
  
  // Your existing form state
  const [goalInEth, setGoalInEth] = useState('');
  const [durationInDays, setDurationInDays] = useState(30);
  const [tokensPerEth, setTokensPerEth] = useState('');

  // ... rest of your component
}
```

**Step 3: Handle Form Submission**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation (client-side)
  if (Number(goalInEth) <= 0) {
    alert('Goal must be greater than 0');
    return;
  }
  if (durationInDays <= 0 || durationInDays > 365) {
    alert('Duration must be between 1 and 365 days');
    return;
  }
  if (Number(tokensPerEth) <= 0) {
    alert('Reward rate must be greater than 0');
    return;
  }

  // Call the hook
  await createCampaign({ goalInEth, durationInDays, tokensPerEth });
};
```

**Step 4: Auto-Redirect on Success**
```typescript
// Add this useEffect in your component
import { useEffect } from 'react';

useEffect(() => {
  if (isSuccess && newCampaignAddress) {
    // Wait 2 seconds to show success message, then redirect
    setTimeout(() => {
      navigate(`/campaign/${newCampaignAddress}`);
    }, 2000);
  }
}, [isSuccess, newCampaignAddress, navigate]);
```

**Step 5: Update Your Submit Button**

Replace your current submit button with:

```typescript
<TransactionButton
  onClick={handleSubmit}
  label="Create Campaign"
  txState={
    isPending ? 'pending' :
    isConfirming ? 'confirming' :
    isSuccess ? 'success' :
    error ? 'error' :
    'idle'
  }
  txHash={txHash}
  disabled={!goalInEth || !tokensPerEth}
/>

{/* Show error message */}
{error && (
  <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
    Error: {error.message}
  </div>
)}

{/* Show success message */}
{isSuccess && newCampaignAddress && (
  <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
    ✅ Campaign created! Redirecting to campaign page...
    <div className="text-sm mt-2">
      Address: {newCampaignAddress}
    </div>
  </div>
)}
```

---

#### **📊 Form Validation Rules**

Before calling `createCampaign`, validate:

| Field | Rule | Error Message |
|-------|------|---------------|
| `goalInEth` | Must be > 0 | "Goal must be greater than 0 ETH" |
| `goalInEth` | Must be valid number | "Please enter a valid ETH amount" |
| `durationInDays` | Must be 1-365 | "Duration must be between 1 and 365 days" |
| `tokensPerEth` | Must be > 0 | "Reward rate must be greater than 0" |
| `tokensPerEth` | Must be whole number | "Reward rate must be a whole number" |

---

#### **🧪 Testing Checklist**

#### **🧪 Testing Checklist**

**Basic Flow:**
- [ ] Fill form with valid data (Goal: 1, Duration: 30, Reward: 100)
- [ ] Click "Create Campaign"
- [ ] Wallet opens → Confirm transaction
- [ ] Button shows "Confirming..." then "Pending..."
- [ ] Success message appears with campaign address
- [ ] Auto-redirect to new campaign page after 2 seconds

**Validation Tests:**
- [ ] Try empty goal → Should show error/disable button
- [ ] Try 0 goal → Should show validation error
- [ ] Try negative duration → Should show validation error
- [ ] Try 0 reward rate → Should show validation error

**Blockchain Tests:**
- [ ] New campaign appears in "All Campaigns" list
- [ ] Creator address matches your wallet
- [ ] Goal amount is correct on campaign detail page
- [ ] Deadline is current_time + duration_seconds
- [ ] Campaign starts in "Funding" state

**Error Scenarios:**
- [ ] Reject in wallet → Should NOT show error (user cancelled)
- [ ] No ETH for gas → Should show "Insufficient funds for gas"
- [ ] Wrong network → wagmi should prompt to switch

---

#### **💡 Key Learnings**

**Unit Conversions:**
```typescript
// ETH → Wei
parseEther("1.5")  // Returns: 1500000000000000000n (bigint)

// Days → Seconds
const seconds = days * 24 * 60 * 60  // 30 days = 2592000 seconds

// String → BigInt
BigInt("100")  // Returns: 100n
```

**Event Parsing:**
```typescript
// Why we parse events:
// - Contract doesn't return values from write functions
// - Events are the ONLY way to get the new campaign address
// - Events are part of transaction receipt (logs array)

const decoded = decodeEventLog({
  abi: factoryABI,           // Contract ABI with event definitions
  data: log.data,            // Event data (indexed parameters)
  topics: log.topics,        // Event topics (non-indexed parameters)
});

// Result: { eventName: 'CampaignCreated', args: { campaign, creator, goal, deadline } }
```

**Transaction States:**
```
isPending     → User hasn't confirmed in wallet yet
isConfirming  → Transaction sent, waiting for block inclusion
isSuccess     → Transaction included in a block
error         → Something went wrong
```

---

#### **🔍 Common Issues & Solutions**

**Issue 1: Event not found in logs**
```typescript
// Problem: campaignCreatedLog is undefined
// Solution: Check if event name in ABI matches exactly
// Factory event: "CampaignCreated" vs "CompaignCreated" (typo in contract?)
```

**Issue 2: "Insufficient funds" error**
```typescript
// Problem: User doesn't have enough ETH for gas
// Solution: Show helpful message, link to faucet for testnet
if (error?.message.includes('insufficient funds')) {
  return "You need more ETH for gas. Visit Sepolia faucet: https://sepoliafaucet.com";
}
```

**Issue 3: parseEther fails**
```typescript
// Problem: User enters invalid number like "1.2.3"
// Solution: Validate before calling parseEther
try {
  const goalWei = parseEther(input.goalInEth);
} catch (e) {
  alert('Invalid ETH amount');
  return;
}
```

---

#### **🎯 What's Next**

After completing Step 5.2, you should:
1. ✅ Have a working campaign creation flow
2. ✅ Understand event parsing
3. ✅ Know how to convert units (ETH ↔ Wei)
4. ✅ Be able to parse transaction receipts

**Next:** Step 5.3 - Token Approval (Admin Only)

---

### **Step 5.3: Token Approval Flow (Admin Only)**

**Duration:** 1-2 sessions\
**Goal:** Set up token distribution for the entire platform

#### **Understanding Your Architecture**

Your contracts use a **centralized token distribution** model:

```
Normal DApp (Decentralized):
User contributes → Contract calls token.transferFrom(user, ...)
├─ User must approve token to campaign
└─ User controls their tokens

Your DApp (Centralized Distribution):
User contributes → Contract calls factory.distributeTokens(user, amount)
    ↓
Factory (as admin) calls token.transferFrom(admin, user, amount)
├─ Admin (you) holds all tokens
├─ Admin approves factory once
└─ All campaigns use same approval
```

**Why centralized?**
- Simpler for campaign creators (no approval step)
- Easier to manage token distribution
- Admin controls reward quality

**Trade-off:**
- Requires trust in admin
- Less decentralized

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files to Create:**
- ✨ `src/Pages/AdminDashboardPage.tsx` (admin-only page)
- ✨ `src/features/campaigns/hooks/useTokenApproval.ts` (approval hook)
- ✨ `src/contracts/ABI/ERC20ABI.ts` (standard ERC20 ABI)

**Files to Modify:**
- 📝 `src/main.tsx` (add /admin route)

---

#### **📦 Step 1: Create ERC20 ABI**

**File:** `src/contracts/ABI/ERC20ABI.ts`

```typescript
// Minimal ERC20 ABI for approve, allowance, balanceOf
export const erc20ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
```

---

#### **📦 Step 2: Create Token Approval Hook**

**File:** `src/features/campaigns/hooks/useTokenApproval.ts`

**Imports:**
```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { FACTORY_ADDRESS, TOKEN_ADDRESS } from '../../../contracts/config';
import { erc20ABI } from '../../../contracts/ABI/ERC20ABI';
```

**Hook Structure:**
```typescript
export function useTokenApproval() {
  const { address: userAddress } = useAccount();

  // 1. Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, FACTORY_ADDRESS] : undefined,
  });

  // 2. Read user's token balance
  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });

  // 3. Write: Approve tokens
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 4. Approve function
  const approveTokens = async (amountInTokens: string) => {
    // Convert to wei (assuming 18 decimals)
    const amount = parseUnits(amountInTokens, 18);

    writeContract({
      address: TOKEN_ADDRESS,
      abi: erc20ABI,
      functionName: 'approve',
      args: [FACTORY_ADDRESS, amount],
    });
  };

  // 5. Refetch allowance after success
  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
    }
  }, [isSuccess, refetchAllowance]);

  return {
    allowance: allowance ? formatUnits(allowance, 18) : '0',        // Convert to readable format
    balance: balance ? formatUnits(balance, 18) : '0',
    approveTokens,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
  };
}
```

---

#### **🎨 Step 3: Create Admin Dashboard Page**

**File:** `src/Pages/AdminDashboardPage.tsx`

**Imports:**
```typescript
import { useAccount, useReadContract } from 'wagmi';
import { useState } from 'react';
import { useTokenApproval } from '../features/campaigns/hooks/useTokenApproval';
import { TransactionButton } from '../components/TransactionButton';
import { FACTORY_ADDRESS } from '../contracts/config';
import { factoryABI } from '../contracts/ABI/FactoryABI';
```

**Component Structure:**
```typescript
export function AdminDashboardPage() {
  const { address: userAddress } = useAccount();
  const [approvalAmount, setApprovalAmount] = useState('1000000'); // 1 million default

  // 1. Check if user is admin
  const { data: adminAddress } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'adminAddress',
  });

  // 2. Get approval hook
  const { allowance, balance, approveTokens, isPending, isConfirming, isSuccess, txHash, error } = useTokenApproval();

  // 3. Check access
  const isAdmin = userAddress && adminAddress && userAddress.toLowerCase() === adminAddress.toLowerCase();

  if (!userAddress) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">Please connect your wallet to access admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-4 text-red-600">Only the factory admin can access this page.</p>
        <p className="mt-2 text-sm text-gray-500">Admin address: {adminAddress}</p>
        <p className="text-sm text-gray-500">Your address: {userAddress}</p>
      </div>
    );
  }

  // 4. Admin dashboard UI
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔐 Admin Dashboard</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase">Token Balance</h3>
          <p className="text-2xl font-bold">{Number(balance).toLocaleString()} Tokens</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase">Current Allowance</h3>
          <p className="text-2xl font-bold">{Number(allowance).toLocaleString()} Tokens</p>
          <p className="text-xs text-gray-500 mt-1">
            {Number(allowance) === 0 ? '❌ No approval set' :
             Number(allowance) < 100000 ? '⚠️ Low allowance' :
             '✅ Sufficient'}
          </p>
        </div>
      </div>

      {/* Approval Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Approve Token Distribution</h2>
        <p className="text-gray-600 mb-4">
          The factory needs your approval to distribute tokens to campaign contributors.
          You only need to do this once (or when allowance runs low).
        </p>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setApprovalAmount('1000000')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            1 Million
          </button>
          <button
            onClick={() => setApprovalAmount('10000000')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            10 Million
          </button>
          <button
            onClick={() => setApprovalAmount('100000000')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            100 Million
          </button>
        </div>

        {/* Custom input */}
        <input
          type="number"
          value={approvalAmount}
          onChange={(e) => setApprovalAmount(e.target.value)}
          placeholder="Amount to approve"
          className="w-full p-3 border rounded mb-4"
        />

        {/* Submit button */}
        <TransactionButton
          onClick={() => approveTokens(approvalAmount)}
          label={`Approve ${Number(approvalAmount).toLocaleString()} Tokens`}
          txState={
            isPending ? 'pending' :
            isConfirming ? 'confirming' :
            isSuccess ? 'success' :
            error ? 'error' :
            'idle'
          }
          txHash={txHash}
          disabled={!approvalAmount || Number(approvalAmount) <= 0}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {error.message}
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            ✅ Approval successful! New allowance: {allowance} tokens
          </div>
        )}
      </div>
    </div>
  );
}
```

---

#### **🔗 Step 4: Add Route**

**File:** `src/main.tsx`

Add this route to your router:

```typescript
import { AdminDashboardPage } from './Pages/AdminDashboardPage';

// Inside your router configuration:
{
  path: '/admin',
  element: <AdminDashboardPage />,
}
```

---

#### **🧪 Testing Checklist**

**Access Control:**
- [ ] Visit /admin with admin wallet → Shows dashboard
- [ ] Visit /admin with non-admin wallet → Shows "Access Denied"
- [ ] Visit /admin without wallet → Shows "Connect wallet" message

**Approval Flow:**
- [ ] Shows current allowance correctly
- [ ] Shows token balance correctly
- [ ] Can input custom amount
- [ ] Preset buttons work (1M, 10M, 100M)
- [ ] Click approve → Wallet opens
- [ ] Confirm → Transaction pending
- [ ] Success → Allowance updates

**Status Indicators:**
- [ ] 0 allowance → Shows ❌ No approval set
- [ ] < 100k allowance → Shows ⚠️ Low allowance
- [ ] >= 100k allowance → Shows ✅ Sufficient

---

#### **💡 Key Learnings**

**ERC20 Allowance Pattern:**
```typescript
// Step 1: Owner approves spender
token.approve(spender, amount);

// Step 2: Spender can now transfer on owner's behalf
token.transferFrom(owner, recipient, amount);

// This is how factory distributes tokens:
// Admin approves factory → Factory transfers from admin to contributors
```

**Unit Conversion:**
```typescript
// Tokens usually have 18 decimals
parseUnits("1000000", 18)    // 1M tokens → 1000000000000000000000000n (bigint)
formatUnits(1000000n, 18)    // 1000000n → "0.000001" (readable string)
```

**Protected Routes:**
```typescript
// Always check on client AND rely on contract checks
// Client check: Better UX (show helpful message)
// Contract check: Security (prevents unauthorized calls)
if (userAddress.toLowerCase() !== adminAddress.toLowerCase()) {
  return <AccessDenied />;
}
```

---

### **Step 5.4: Contribute Transaction**

**Duration:** 2-3 sessions\
**Goal:** Main user interaction - contributing to campaigns

#### **Understanding Contribution Flow**

```
User on campaign detail page
     ↓
Enters amount (in ETH) they want to contribute
     ↓
Sees live calculation of token reward:
├─ Formula: tokenReward = ethAmount * rewardRate
├─ Example: 0.5 ETH * 100 tokens/ETH = 50 tokens
└─ Should match contract's calculation
     ↓
Clicks "Contribute"
     ↓
Validation checks → Send transaction to campaign.contribute() with msg.value
     ↓
Wait for confirmation → Success → Refetch data → Update UI
```

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files to Create:**
- ✨ `src/features/campaigns/hooks/useContribute.ts` (contribution hook)

**Files to Modify:**
- 📝 `src/Pages/CampaignDetailPage.tsx` (add contribution UI)

---

#### **📦 Step 1: Create Contribution Hook**

**File:** `src/features/campaigns/hooks/useContribute.ts`

**Imports:**
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { masterABI } from '../../../contracts/ABI/MasterABI';
```

**Hook Structure:**
```typescript
export function useContribute(campaignAddress: Address) {
  // 1. Write hook
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 2. Contribute function
  const contribute = async (amountInEth: string) => {
    const valueWei = parseEther(amountInEth);  // Convert ETH to wei

    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: 'contribute',
      args: [],             // contribute() has no arguments
      value: valueWei,      // Send ETH with transaction
    });
  };

  return {
    contribute,
    isPending,      // User confirming in wallet
    isConfirming,   // Waiting for blockchain confirmation
    isSuccess,      // Transaction confirmed
    txHash,         // Transaction hash
    error,
  };
}
```

---

#### **🎨 Step 2: Add Contribution UI to CampaignDetailPage**

**File:** `src/Pages/CampaignDetailPage.tsx`

**Imports to Add:**
```typescript
import { useState, useEffect } from 'react';
import { useContribute } from '../features/campaigns/hooks/useContribute';
import { TransactionButton } from '../components/TransactionButton';
import { useAccount } from 'wagmi';
```

**Component Enhancement:**

Inside your `CampaignDetailPage` component:

```typescript
function CampaignDetailPage() {
  const { address: userAddress } = useAccount();
  const { campaignAddress } = useParams();  // From route params
  
  // Your existing hooks
  const { data: campaignDetails, refetch: refetchDetails } = useCampaignDetails(campaignAddress);
  const { data: userContribution, refetch: refetchContribution } = useUserContribution(campaignAddress);
  
  // NEW: Contribution hook
  const { contribute, isPending, isConfirming, isSuccess, txHash, error } = useContribute(campaignAddress);
  
  // NEW: Form state
  const [contributionAmount, setContributionAmount] = useState('');
  const [calculatedReward, setCalculatedReward] = useState('0');

  // NEW: Calculate reward live
  useEffect(() => {
    if (contributionAmount && campaignDetails) {
      const amountNum = Number(contributionAmount);
      const reward = amountNum * campaignDetails.rewardRate;
      setCalculatedReward(reward.toFixed(2));
    } else {
      setCalculatedReward('0');
    }
  }, [contributionAmount, campaignDetails]);

  // NEW: Refetch data after successful contribution
  useEffect(() => {
    if (isSuccess) {
      // Wait a moment for blockchain to update
      setTimeout(() => {
        refetchDetails();
        refetchContribution();
      }, 2000);
      
      // Clear form
      setContributionAmount('');
    }
  }, [isSuccess, refetchDetails, refetchContribution]);

  // NEW: Validation
  const isCreator = userAddress && campaignDetails?.creator.toLowerCase() === userAddress.toLowerCase();
  const canContribute = 
    userAddress &&                              // Wallet connected
    !isCreator &&                               // Not the creator
    campaignDetails?.status === 'Funding' &&    // Campaign is funding
    Number(contributionAmount) > 0;             // Valid amount

  // ... rest of your component
}
```

**Add Contribution Section to JSX:**

```typescript
// Add this section in your return statement, after campaign details
return (
  <div className="max-w-4xl mx-auto p-8">
    {/* Your existing campaign details */}
    
    {/* NEW: Contribution Section */}
    {campaignDetails && (
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">💰 Contribute to Campaign</h2>
        
        {/* Show different messages based on status */}
        {campaignDetails.status !== 'Funding' && (
          <div className="p-4 bg-gray-100 text-gray-700 rounded">
            Campaign is no longer accepting contributions (Status: {campaignDetails.status})
          </div>
        )}
        
        {isCreator && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
            ⚠️ Campaign creators cannot contribute to their own campaigns
          </div>
        )}
        
        {!userAddress && (
          <div className="p-4 bg-blue-100 text-blue-700 rounded">
            Please connect your wallet to contribute
          </div>
        )}
        
        {/* Contribution Form */}
        {canContribute && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Contribution Amount (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="0.1"
                className="w-full p-3 border rounded"
              />
            </div>

            {/* Live Reward Calculator */}
            {Number(contributionAmount) > 0 && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-gray-600">You will receive:</p>
                <p className="text-2xl font-bold text-green-700">
                  {calculatedReward} Reward Tokens
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Calculation: {contributionAmount} ETH × {campaignDetails.rewardRate} tokens/ETH
                </p>
              </div>
            )}

            {/* Submit Button */}
            <TransactionButton
              onClick={() => contribute(contributionAmount)}
              label={`Contribute ${contributionAmount || '...'} ETH`}
              txState={
                isPending ? 'pending' :
                isConfirming ? 'confirming' :
                isSuccess ? 'success' :
                error ? 'error' :
                'idle'
              }
              txHash={txHash}
              disabled={!contributionAmount || Number(contributionAmount) <= 0}
            />

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                {error.message.includes('insufficient') ? (
                  <>
                    <strong>Insufficient Funds</strong>
                    <p>You don't have enough ETH for this contribution + gas fees.</p>
                  </>
                ) : error.message.includes('user rejected') ? (
                  <p>Transaction cancelled by user.</p>
                ) : (
                  <p>Error: {error.message}</p>
                )}
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                <strong>✅ Contribution Successful!</strong>
                <p>You contributed {contributionAmount} ETH and received {calculatedReward} tokens!</p>
                <p className="text-xs mt-2">Campaign data will update momentarily...</p>
              </div>
            )}
          </>
        )}
      </div>
    )}
  </div>
);
```

---

#### **📊 Enhanced: Show User's Total Contribution**

Add this display section after the contribution form:

```typescript
{/* Show user's contribution history */}
{userContribution && Number(userContribution) > 0 && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
    <h3 className="font-semibold mb-2">Your Contribution</h3>
    <p className="text-lg">
      You have contributed: <strong>{userContribution} ETH</strong>
    </p>
    <p className="text-sm text-gray-600 mt-1">
      Tokens earned: {Number(userContribution) * campaignDetails.rewardRate}
    </p>
  </div>
)}
```

---

#### **🧪 Testing Checklist**

**Basic Flow:**
- [ ] Open campaign detail page
- [ ] Enter amount (e.g., 0.1 ETH)
- [ ] See live token reward calculation
- [ ] Click "Contribute"
- [ ] Wallet opens → Confirm
- [ ] Button shows "Confirming..." then "Pending..."
- [ ] Success message appears
- [ ] Campaign totalRaised increases
- [ ] User's contribution shows updated amount
- [ ] Token balance increases in wallet

**Validation Tests:**
- [ ] Try contributing as creator → Should show warning
- [ ] Try contributing 0 → Button disabled
- [ ] Try negative amount → Invalid input
- [ ] Campaign ended → Shows "No longer accepting" message
- [ ] Not connected → Shows "Connect wallet" message

**Edge Cases:**
- [ ] Contribute exact amount to reach goal
- [ ] Campaign auto-changes to "Successful" status
- [ ] Multiple contributions from same user
- [ ] userContribution shows sum of all contributions
- [ ] Try contributing after deadline (should fail on blockchain)

**Error Scenarios:**
- [ ] Insufficient ETH → Shows helpful error
- [ ] User rejects in wallet → Shows cancellation (not error)
- [ ] Admin hasn't approved tokens → Contract reverts with message

---

#### **💡 Key Learnings**

**Payable Functions:**
```typescript
// Regular function call
writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'regularFunction',
  args: [arg1, arg2],
});

// Payable function (sends ETH)
writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'contribute',
  args: [],              // contribute() has no args
  value: parseEther("0.5"),  // Sends 0.5 ETH with transaction
});
```

**Live Calculations:**
```typescript
// Keep it simple for UI
const tokenReward = ethAmount * rewardRate;

// Contract does more complex calculation to handle edge cases:
// uint256 tokenReward = ((msg.value * 10^18) * rewardRate) / 1 ether;
// But for display purposes, simple multiplication works
```

**Data Refetching:**
```typescript
// After successful transaction, refetch affected data
useEffect(() => {
  if (isSuccess) {
    // Small delay for blockchain to update
    setTimeout(() => {
      refetchCampaignDetails();   // Update totalRaised, state
      refetchUserContribution();  // Update user's contribution
    }, 2000);
  }
}, [isSuccess]);
```

**User Experience:**
```typescript
// Show specific error messages
if (error.message.includes('insufficient')) {
  return "You need more ETH (visit faucet)";
}
if (error.message.includes('user rejected')) {
  return null;  // Don't show error for user cancellation
}
// Generic error
return error.message;
```

---

#### **🎯 What's Next**

After Step 5.4, users can now contribute to campaigns! Next steps:

✅ **Completed:**
- Transaction pattern (5.1)
- Create campaign (5.2)
- Token approval (5.3)
- Contribute (5.4)

🔜 **Remaining:**
- Step 5.5: Finalize (set campaign state after deadline)
- Step 5.6: Withdraw (creator gets ETH)
- Step 5.7: Refund (contributors get ETH back)
- Step 5.8: Transaction history (track all actions)

---

### **Step 5.5: Finalize Transaction**

**Challenge 4: Error Scenarios**
```
Things that can go wrong:
1. User is creator (contract revert)
   → Show: "Campaign creators cannot contribute"
   
2. Deadline passed (contract revert)
   → Show: "Campaign has ended"
   
3. Campaign failed (contract revert)
   → Show: "Campaign failed to reach goal, cannot contribute"
   
4. Admin didn't approve tokens (contract revert)
   → Show: "Platform token distribution not configured"
   
5. User doesn't have enough ETH (gas estimation error)
   → Show: "Insufficient ETH for contribution + gas"
   
6. User rejects in wallet
   → Not an error, just cancelled (don't show error UI)
```

#### **What You Need to Research**

1. **Payable functions in wagmi:**
   - How do you send value with `useWriteContract`?
   - What's the `value` parameter?

2. **BigInt arithmetic:**
   - How to calculate rewards without losing precision
   - When to use BigInt vs Number

3. **User feedback:**
   - How to show "insufficient allowance" error differently from other errors
   - How to distinguish user cancellation from errors

4. **State refetching:**
   - Which data needs to refresh after contribution?
   - How do you invalidate wagmi cache?

#### **Deliverables for Step 5.4**

User should be able to:
1. Enter contribution amount
2. See live token reward calculation
3. See validation errors if invalid
4. Click "Contribute"
5. Confirm in wallet
6. See "Contribution successful! You earned X tokens"
7. See their contribution in the "Your Contribution" section
8. See campaign totalRaised update
9. See campaign state change if goal was reached
10. Token balance in wallet increases

**Testing Scenarios:**
- [ ] Contribute normal amount (0.1-1 ETH)
- [ ] Contribute exact amount to reach goal
- [ ] See campaign state auto-change to Successful
- [ ] Contribute as different users to same campaign
- [ ] Try contributing after deadline (should fail)
- [ ] Try contributing as creator (should fail)
- [ ] Contribution amount exceeds balance (should fail)

**Learning Checkpoints:**
- Can you explain why factory admin has to approve tokens?
- What's the difference between user's contribution being 0 vs not existing?
- Why do we refetch data after a successful contribution?

---

### **Step 5.5: Finalize Transaction**

**Duration:** 1 session\
**Goal:** Set campaign state after deadline

#### **Understanding Finalization**

```
Campaign has two ways to transition state:

Automatic:
├─ When goal is reached during contribution
└─ contribute() sets state = Successful

Manual:
├─ When deadline passes without reaching goal
├─ Requires calling finalize()
└─ finalize() checks:
   ├─ If totalRaised >= goal → Successful
   └─ Else → Failed
```

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files to Create:**
- ✨ `src/features/campaigns/hooks/useFinalize.ts`

**Files to Modify:**
- 📝 `src/Pages/CampaignDetailPage.tsx`

---

#### **📦 Step 1: Create Finalize Hook**

**File:** `src/features/campaigns/hooks/useFinalize.ts`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { masterABI } from '../../../contracts/ABI/MasterABI';

export function useFinalize(campaignAddress: Address) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const finalize = async () => {
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: 'finalize',
      args: [],  // No arguments needed
    });
  };

  return {
    finalize,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
  };
}
```

---

#### **🎨 Step 2: Add Finalize UI to CampaignDetailPage**

**Import the hook:**
```typescript
import { useFinalize } from '../features/campaigns/hooks/useFinalize';
```

**Use the hook:**
```typescript
const { finalize, isPending, isConfirming, isSuccess, txHash, error } = useFinalize(campaignAddress);
```

**Refetch after success:**
```typescript
useEffect(() => {
  if (isSuccess) {
    setTimeout(() => {
      refetchDetails();  // Campaign state will change
    }, 2000);
  }
}, [isSuccess, refetchDetails]);
```

**Add Finalize Section to JSX:**

```typescript
{/* Finalize Section - Show only when deadline passed and still Funding */}
{campaignDetails?.status === 'Funding' && 
 Date.now() > campaignDetails.deadlineTimestamp * 1000 && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">⏰ Campaign Ended</h2>
    <p className="text-gray-600 mb-4">
      The campaign deadline has passed. Click below to finalize the campaign state.
    </p>
    
    <TransactionButton
      onClick={finalize}
      label="Finalize Campaign"
      txState={
        isPending ? 'pending' :
        isConfirming ? 'confirming' :
        isSuccess ? 'success' :
        error ? 'error' :
        'idle'
      }
      txHash={txHash}
    />

    {isSuccess && (
      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
        ✅ Campaign finalized! Status will update momentarily.
      </div>
    )}
    
    {error && (
      <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
        Error: {error.message}
      </div>
    )}
  </div>
)}
```

---

#### **🧪 Testing Checklist**

- [ ] Create campaign with short deadline (e.g., 1 minute)
- [ ] Wait for deadline to pass
- [ ] "Finalize" button appears
- [ ] Click finalize → Confirm in wallet
- [ ] Campaign state changes to "Successful" (if goal met) or "Failed"
- [ ] Try finalizing before deadline → Contract rejects
- [ ] Try finalizing already-finalized campaign → Should fail gracefully

---

### **Step 5.6: Withdraw Transaction (Creator)**

**Duration:** 1 session\
**Goal:** Creator withdraws raised ETH

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files to Create:**
- ✨ `src/features/campaigns/hooks/useWithdraw.ts`

**Files to Modify:**
- 📝 `src/Pages/CampaignDetailPage.tsx`

---

#### **📦 Step 1: Create Withdraw Hook**

**File:** `src/features/campaigns/hooks/useWithdraw.ts`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { masterABI } from '../../../contracts/ABI/MasterABI';

export function useWithdraw(campaignAddress: Address) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const withdraw = async () => {
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: 'withdraw',
      args: [],
    });
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
  };
}
```

---

#### **🎨 Step 2: Add Withdraw UI to CampaignDetailPage**

**Import:**
```typescript
import { useWithdraw } from '../features/campaigns/hooks/useWithdraw';
```

**Use hook:**
```typescript
const { withdraw, isPending: isWithdrawPending, isConfirming: isWithdrawConfirming, isSuccess: isWithdrawSuccess, txHash: withdrawTxHash, error: withdrawError } = useWithdraw(campaignAddress);
```

**Add Withdraw Section:**

```typescript
{/* Withdraw Section - Show only for creator when Successful */}
{isCreator && campaignDetails?.status === 'Successful' && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">💰 Withdraw Funds</h2>
    <p className="text-gray-600 mb-4">
      Congratulations! Your campaign was successful. Withdraw the raised funds.
    </p>
    <p className="text-lg font-semibold mb-4">
      Amount: {campaignDetails.totalRaisedWei} ETH
    </p>
    
    <TransactionButton
      onClick={withdraw}
      label={`Withdraw ${campaignDetails.totalRaisedWei} ETH`}
      txState={
        isWithdrawPending ? 'pending' :
        isWithdrawConfirming ? 'confirming' :
        isWithdrawSuccess ? 'success' :
        withdrawError ? 'error' :
        'idle'
      }
      txHash={withdrawTxHash}
    />

    {isWithdrawSuccess && (
      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
        ✅ Funds withdrawn! Check your wallet balance.
      </div>
    )}
  </div>
)}

{/* Show if already withdrawn */}
{isCreator && campaignDetails?.status === 'Withdrawn' && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">✅ Funds Withdrawn</h2>
    <p className="text-gray-600">
      You have already withdrawn the campaign funds.
    </p>
  </div>
)}
```

---

#### **🧪 Testing Checklist**

- [ ] Create campaign → Reach goal → Finalize → See withdraw button (creator only)
- [ ] Non-creator doesn't see withdraw button
- [ ] Click withdraw → ETH appears in wallet
- [ ] Campaign status changes to "Withdrawn"
- [ ] Try withdrawing again → Should fail (already withdrawn)

---

### **Step 5.7: Refund Transaction (Contributors)**

**Duration:** 1 session\
**Goal:** Contributors get ETH back if campaign fails

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

**Files to Create:**
- ✨ `src/features/campaigns/hooks/useRefund.ts`

**Files to Modify:**
- 📝 `src/Pages/CampaignDetailPage.tsx`

---

#### **📦 Step 1: Create Refund Hook**

**File:** `src/features/campaigns/hooks/useRefund.ts`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { masterABI } from '../../../contracts/ABI/MasterABI';

export function useRefund(campaignAddress: Address) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const refund = async () => {
    writeContract({
      address: campaignAddress,
      abi: masterABI,
      functionName: 'refund',
      args: [],
    });
  };

  return {
    refund,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
  };
}
```

---

#### **🎨 Step 2: Add Refund UI to CampaignDetailPage**

**Import:**
```typescript
import { useRefund } from '../features/campaigns/hooks/useRefund';
```

**Use hook:**
```typescript
const { refund, isPending: isRefundPending, isConfirming: isRefundConfirming, isSuccess: isRefundSuccess, txHash: refundTxHash, error: refundError } = useRefund(campaignAddress);
```

**Add Refund Section:**

```typescript
{/* Refund Section - Show only when Failed and user contributed */}
{!isCreator && 
 campaignDetails?.status === 'Failed' && 
 userContribution && Number(userContribution) > 0 && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">💸 Claim Refund</h2>
    <p className="text-gray-600 mb-4">
      This campaign failed to reach its goal. You can get your contribution back.
    </p>
    <p className="text-lg font-semibold mb-4">
      Your contribution: {userContribution} ETH
    </p>
    
    <TransactionButton
      onClick={refund}
      label={`Get Back ${userContribution} ETH`}
      txState={
        isRefundPending ? 'pending' :
        isRefundConfirming ? 'confirming' :
        isRefundSuccess ? 'success' :
        refundError ? 'error' :
        'idle'
      }
      txHash={refundTxHash}
    />

    {isRefundSuccess && (
      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
        ✅ Refund processed! {userContribution} ETH returned to your wallet.
      </div>
    )}
  </div>
)}

{/* Show if campaign failed but user didn't contribute */}
{!isCreator && 
 campaignDetails?.status === 'Failed' && 
 (!userContribution || Number(userContribution) === 0) && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">❌ Campaign Failed</h2>
    <p className="text-gray-600">
      This campaign failed to reach its goal. You did not contribute.
    </p>
  </div>
)}
```

---

#### **🧪 Testing Checklist**

- [ ] Create campaign → Contribute → Wait deadline → Finalize (Failed) → See refund button
- [ ] Click refund → ETH returns to wallet
- [ ] User contribution becomes 0
- [ ] Try refunding again → Should fail
- [ ] User who didn't contribute sees "You did not contribute" message

---

### **Step 5.8: Transaction History & Notifications (Optional Enhancement)**

**Duration:** 1-2 sessions\
**Goal:** Track user's transactions and show toast notifications

---

#### **🔧 TECHNICAL IMPLEMENTATION GUIDE**

This step is **optional** but greatly improves UX. You'll add:
1. Toast notifications for transaction states
2. Transaction history stored in localStorage

---

#### **📦 Part 1: Toast Notifications**

**Install Library:**
```bash
npm install react-hot-toast
```

**Setup in main.tsx:**
```typescript
import { Toaster } from 'react-hot-toast';

// Inside your App component or main render:
<>
  <Toaster
    position="top-right"
    toastOptions={{
      success: {
        duration: 4000,
        style: { background: '#10b981', color: '#fff' },
      },
      error: {
        duration: 5000,
        style: { background: '#ef4444', color: '#fff' },
      },
    }}
  />
  {/* Rest of your app */}
</>
```

**Enhance Your Hooks:**

Add toast notifications to any transaction hook:

```typescript
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useCreateCampaign() {
  // ... existing code ...

  useEffect(() => {
    if (isPending) {
      toast.loading('Waiting for wallet confirmation...', { id: 'tx' });
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading('Transaction pending...', { id: 'tx' });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction confirmed!', { id: 'tx' });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`, { id: 'tx' });
    }
  }, [error]);

  // ... rest of hook ...
}
```

---

#### **📦 Part 2: Transaction History (Simple Version)**

**Create a utility to store transactions:**

**File:** `src/utils/transactionHistory.ts`

```typescript
export type TransactionRecord = {
  hash: string;
  type: 'create' | 'contribute' | 'finalize' | 'withdraw' | 'refund';
  timestamp: number;
  amount?: string;  // For contributions
};

const STORAGE_KEY = 'crowdfund_tx_history';

export function saveTransaction(record: TransactionRecord) {
  const history = getTransactionHistory();
  history.unshift(record);  // Add to beginning
  
  // Keep only last 20 transactions
  const trimmed = history.slice(0, 20);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getTransactionHistory(): TransactionRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}
```

**Use in Your Hooks:**

```typescript
import { saveTransaction } from '../../../utils/transactionHistory';

export function useCreateCampaign() {
  // ... existing code ...

  useEffect(() => {
    if (isSuccess && txHash) {
      saveTransaction({
        hash: txHash,
        type: 'create',
        timestamp: Date.now(),
      });
    }
  }, [isSuccess, txHash]);

  // ... rest ...
}
```

**Display History (Optional Component):**

**File:** `src/components/TransactionHistory.tsx`

```typescript
import { getTransactionHistory } from '../utils/transactionHistory';
import { useState, useEffect } from 'react';

export function TransactionHistory() {
  const [history, setHistory] = useState(getTransactionHistory());

  useEffect(() => {
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      setHistory(getTransactionHistory());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (history.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold mb-2">Recent Transactions</h3>
      {history.map((tx) => (
        <div key={tx.hash} className="p-3 bg-gray-50 rounded flex justify-between">
          <div>
            <span className="font-semibold">{tx.type}</span>
            {tx.amount && <span className="ml-2 text-sm">({tx.amount} ETH)</span>}
            <div className="text-xs text-gray-500">
              {new Date(tx.timestamp).toLocaleString()}
            </div>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View →
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

#### **🧪 Testing Checklist**

**Toast Notifications:**
- [ ] Create campaign → See "Waiting for wallet..." → "Pending..." → "Success!" toasts
- [ ] Reject in wallet → See error toast
- [ ] Transaction fails → See error with message

**Transaction History (if implemented):**
- [ ] Perform transaction → Appears in history
- [ ] Refresh page → History persists
- [ ] Click Etherscan link → Opens transaction
- [ ] Perform 20+ transactions → Old ones get pruned

---

### **🎉 Phase 5 Complete!**

If you've reached this point, congratulations! You now have:

✅ **Step 5.1:** Transaction pattern with TransactionButton\
✅ **Step 5.2:** Create Campaign with event parsing\
✅ **Step 5.3:** Token Approval (admin)\
✅ **Step 5.4:** Contribute with live reward calculation\
✅ **Step 5.5:** Finalize campaign state\
✅ **Step 5.6:** Withdraw funds (creator)\
✅ **Step 5.7:** Refund (contributors)\
✅ **Step 5.8:** Notifications & history (optional)

---

## 🛠️ **Complete Implementation Checklist**

Before moving to Phase 6 (Polishing & Deployment), verify:

### **Functionality**
- [ ] Can create campaigns on-chain
- [ ] Can contribute ETH to campaigns
- [ ] Token rewards are distributed
- [ ] Can finalize campaigns
- [ ] Can withdraw (if creator and successful)
- [ ] Can refund (if contributor and failed)
- [ ] All transactions show proper status

### **Error Handling**
- [ ] User can't contribute as creator
- [ ] User can't contribute after deadline
- [ ] User can't withdraw as non-creator
- [ ] User can't refund from successful campaign
- [ ] Error messages are user-friendly
- [ ] User rejection doesn't show error UI

### **UX**
- [ ] Transaction buttons show state (idle/pending/confirming/success/error)
- [ ] Toast notifications appear (if implemented)
- [ ] Transaction history shows (if implemented)
- [ ] Can click Etherscan link from tx hash
- [ ] Loading states prevent button mashing
- [ ] Clear feedback at every step
- [ ] Live reward calculations work

### **Testing**
- [ ] Full successful flow: create → contribute → finalize → withdraw
- [ ] Full failed flow: create → contribute → finalize → refund
- [ ] Tested with multiple wallets
- [ ] Tested after network switch
- [ ] Tested with insufficient funds
- [ ] Tested gas estimation errors

---

## 💡 **Key Concepts Learned**

### **Web3 Patterns**
- Transaction lifecycle (prepare → submit → pending → confirmed)
- Payable functions (`value` parameter)
- Event parsing from transaction receipts
- Gas estimation and error handling

### **React Patterns**
- Custom hooks for transactions
- State management during async operations
- Effect cleanup and dependencies
- Optimistic vs pessimistic UI updates

### **User Experience**
- Progressive disclosure (show only relevant actions)
- Clear state transitions
- Helpful error messages
- Transaction history and tracking

---

## 🚀 **What's Next: Phase 6**

Now that all write operations work, Phase 6 will focus on:

1. **Polish UI/UX**
   - Better loading states
   - Animations
   - Responsive design
   - Accessibility

2. **Advanced Features** (Optional)
   - Campaign categories
   - Search and filters
   - Pagination
   - Featured campaigns

3. **Deployment**
   - Build for production
   - Deploy to Vercel/Netlify
   - Test on mainnet (if applicable)
   - Write README

4. **Documentation**
   - User guide
   - Developer documentation
   - Architecture diagrams

---

**Congratulations on completing Phase 5! 🎉 You now have a fully functional crowdfunding DApp!**

---

### **Step 5.6: Withdraw Transaction (Creator)**

**Duration:** 1 session\
**Goal:** Creator withdraws raised ETH

#### **Understanding Withdrawal**

```
Only possible when:
├─ Campaign state = Successful
├─ Not already withdrawn
└─ Caller is creator

What happens:
├─ All ETH sent to creator
├─ State changes to Withdrawn
└─ Withdrawal event emitted

Why the Withdrawn state?
├─ Prevents double-withdrawal
└─ Clear signal that funds were claimed
```

#### **When to Show Withdraw Button**

On campaign detail page (only for creator):
```
if (isCreator && campaign.status === "Successful") {
  Show: "Withdraw Funds"
  Button text: `Withdraw ${totalRaised} ETH`
} else if (isCreator && campaign.status === "Withdrawn") {
  Show: "✅ Funds Withdrawn"
  Button: disabled
}
```

#### **What You Need to Research**

1. **Ownership checks:**
   - How do you verify user is creator on client-side?
   - Why not just rely on contract check?

2. **Post-withdrawal UI:**
   - What should show after successful withdrawal?
   - How to prevent user from trying again?

#### **Deliverables for Step 5.6**

Creator should be able to:
1. See "Withdraw Funds" button (only if successful)
2. Click button
3. Confirm in wallet
4. See "Withdrawal successful! X ETH sent to your wallet"
5. Button changes to "✅ Withdrawn" and is disabled
6. Campaign state changes to "Withdrawn"

**Testing Scenario:**
- [ ] Create campaign → Reach goal → Finalize → Withdraw
- [ ] Try withdrawing as non-creator (should fail silently or show error)
- [ ] Try withdrawing twice (should fail on 2nd attempt)
- [ ] Check ETH balance increased in wallet

---

### **Step 5.7: Refund Transaction (Contributors)**

**Duration:** 1 session\
**Goal:** Contributors get ETH back if campaign fails

#### **Understanding Refund**

```
Only possible when:
├─ Campaign state = Failed
├─ User has contributed (contribution > 0)
└─ User can only refund their own amount

What happens:
├─ User's contribution set to 0
├─ User's ETH returned
└─ Refund event emitted

Important:
├─ User does NOT get tokens back
├─ Tokens are reward for participation
└─ Even failed campaign gives "thanks for trying" tokens
```

#### **When to Show Refund Button**

On campaign detail page (only for contributors in failed campaigns):
```
if (campaign.status === "Failed" && userContribution > 0) {
  Show: "Campaign Failed - Claim Refund"
  Button text: `Get Back ${userContribution} ETH`
} else if (campaign.status === "Failed" && userContribution === 0) {
  Show: "Campaign Failed"
  Message: "You didn't contribute to this campaign"
}
```

#### **What You Need to Research**

1. **Contribution tracking:**
   - How to know if user contributed?
   - What if user already refunded?

2. **Partial refunds:**
   - If user contributed twice, do they get both amounts?
   - How does contract track this?

#### **Deliverables for Step 5.7**

Contributor should be able to:
1. See campaign failed
2. See "Claim Refund" button (if they contributed)
3. Click button
4. Confirm in wallet
5. See "Refund processed! X ETH returned to your wallet"
6. Button disappears or shows "✅ Refunded"
7. ETH balance in wallet increases

**Testing Scenario:**
- [ ] Create campaign with high goal → Contribute → Wait deadline → Finalize → Refund
- [ ] Try refunding twice (contribution becomes 0, so can't refund again)
- [ ] Check wallet balance increased
- [ ] Verify you still have the tokens

---

### **Step 5.8: Transaction History & Notifications**

**Duration:** 1-2 sessions\
**Goal:** Show user what they've done

#### **Understanding Transaction History**

```
User performs actions:
├─ Create campaign
├─ Contribute to campaign
├─ Finalize campaign
├─ Withdraw funds
└─ Refund

The app should track and display this.

Options:
1. Query events from contract (future learning)
2. Store in localStorage (easy, Phase 5)
3. Store in database (requires backend)

Phase 5 approach: localStorage
```

#### **What to Store**

```typescript
type Transaction = {
  type: "create" | "contribute" | "finalize" | "withdraw" | "refund"
  timestamp: number
  campaignAddress: string
  amount?: string // ETH or tokens
  txHash: string
  status: "pending" | "confirmed" | "failed"
}
```

#### **Where to Show History**

Option 1: Header notification bell
```
Header right side:
├─ Bell icon with red dot (if new transactions)
├─ Click → Show last 5 transactions
└─ Each transaction:
   ├─ Type: "Contributed"
   ├─ Amount: "0.5 ETH"
   ├─ Time: "2 hours ago"
   ├─ Status: "✅ Confirmed"
   └─ Link: "View on Etherscan"
```

Option 2: User profile/activity page
```
Future phase - skip for now
```

#### **What You Need to Research**

1. **localStorage:**
   - How to save data in browser
   - How to read it back
   - What's the size limit?

2. **Timestamps:**
   - How to show "2 hours ago"
   - date-fns library

3. **Toast notifications:**
   - Show success/error messages
   - Library: react-hot-toast

#### **Deliverables for Step 5.8**

User should be able to:
1. Perform any write operation
2. See toast notification: "Transaction pending..."
3. See second notification: "Transaction confirmed!"
4. Click header bell icon
5. See recent transactions list
6. Click transaction → Opens Etherscan
7. Transactions persist across page refreshes
8. Old transactions are pruned (keep only last 10-20)

**Testing Scenario:**
- [ ] Create campaign → See in history
- [ ] Contribute → See in history
- [ ] Refresh page → History still there
- [ ] Click Etherscan link → Opens in new tab

---

## 🛠️ **Technical Patterns for Phase 5**

### **Pattern 1: Transaction Flow with useWriteContract + useWaitForTransaction**

```
Pseudo-code for any transaction:

function MyComponent() {
  // 1. Set up transaction hook
  const { writeContract, isPending } = useWriteContract()
  
  // 2. Set up confirmation hook
  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: txHash  // From writeContract
  })
  
  // 3. Handle click
  const handleTransaction = async () => {
    await writeContract({
      abi: CONTRACT_ABI,
      address: contractAddress,
      functionName: "functionName",
      args: [arg1, arg2],
      value: ethValue  // Only if payable
    })
  }
  
  // 4. Show state
  return (
    <button
      onClick={handleTransaction}
      disabled={isPending || isConfirming}
    >
      {isPending && "Confirming..."}
      {isConfirming && "Pending..."}
      {!isPending && !isConfirming && "Submit"}
    </button>
  )
}
```

### **Pattern 2: Error Handling with Try-Catch**

```
Research:
- Wagmi's error types
- How to identify specific errors
- User-friendly error messages
```

### **Pattern 3: Cache Invalidation**

```
After successful transaction:
- User's contribution changed
- Campaign totalRaised changed
- Campaign state might have changed

You need to refetch this data:
├─ Using wagmi's queryClient
├─ Re-fetch hook data
└─ Or use useEffect to trigger re-fetch
```

---

## 📚 **Research Topics Summary**

### **Core Web3 Concepts**

1. **Transactions vs Calls**
   - Calls: Read-only, no state change (Phase 4)
   - Transactions: Write to blockchain (Phase 5)
   - Why transactions need confirmation

2. **Gas and Fees**
   - What is gas?
   - Why transaction costs depend on complexity
   - How to estimate gas costs

3. **Events and Logs**
   - Why contracts emit events
   - How to parse event data
   - Why important for UX (get new addresses, etc.)

### **Wagmi-Specific**

1. **useWriteContract hook**
   - Setup and configuration
   - Sending transactions
   - Error handling
   - Return values

2. **useWaitForTransaction hook**
   - Waiting for confirmation
   - Timeout behavior
   - Handling fast/slow networks

3. **Query invalidation**
   - When to refetch data
   - How wagmi caches work
   - Force refetch vs auto-refetch

### **UX/Error Handling**

1. **Common contract errors:**
   - "execution reverted"
   - "insufficient balance"
   - "allowance too low"

2. **Network errors:**
   - RPC timeout
   - Network switched
   - Low gas price

3. **User errors:**
   - User rejected transaction
   - Closed wallet before confirming
   - Transaction took too long

---

## ✅ **Phase 5 Completion Criteria**

You'll know Phase 5 is complete when:

### **Functionality**
- [ ] Can create campaigns on-chain
- [ ] Can contribute ETH to campaigns
- [ ] Can finalize campaigns
- [ ] Can withdraw (if creator and successful)
- [ ] Can refund (if contributor and failed)
- [ ] All transactions show proper status

### **Error Handling**
- [ ] User can't contribute as creator
- [ ] User can't contribute after deadline
- [ ] User can't withdraw as non-creator
- [ ] User can't refund from successful campaign
- [ ] Error messages are user-friendly

### **UX**
- [ ] Transaction buttons show state (pending/confirmed)
- [ ] Toast notifications appear
- [ ] Transaction history shows
- [ ] Can click Etherscan link from history
- [ ] Loading states prevent button mashing
- [ ] Clear feedback at every step

### **Testing**
- [ ] Full successful flow: create → contribute → finalize → withdraw
- [ ] Full failed flow: create → contribute → finalize → refund
- [ ] Tested with multiple wallets
- [ ] Tested after network switch
- [ ] Tested with insufficient funds
- [ ] Tested gas estimation errors

---

## 🚦 **How to Approach Phase 5**

### **Per Step Process:**

1. **Research (15 mins)**
   - Read the "Research Topics" section
   - Look at wagmi docs
   - Understand the flow

2. **Plan (10 mins)**
   - Sketch the component structure
   - Think about state management
   - List error cases

3. **Implement (30-60 mins)**
   - Write the component/hook
   - Handle the happy path first
   - Ignore errors temporarily

4. **Test (15 mins)**
   - Does it work on testnet?
   - Check for console errors
   - Try edge cases

5. **Polish (15 mins)**
   - Add error handling
   - Improve UX
   - Add loading states

6. **Review (with mentor)**
   - Show implementation
   - Walk through the code
   - Ask clarifying questions

### **When Stuck:**

1. Check browser console (F12) for errors
2. Check wagmi/viem docs
3. Look at contract ABI to verify function signature
4. Test with simpler version first
5. Ask mentor with specific error message

---

## 🎓 **Learning Outcomes**

After Phase 5, you'll understand:

**Web3 Concepts:**
- How transactions work on-chain
- Transaction lifecycle (pending → confirmed)
- Why order of operations matters
- How to handle errors from contracts
- Gas estimation and pricing
- Event parsing

**React Patterns:**
- Async state management
- Preventing race conditions
- Optimistic updates vs pessimistic
- Effect cleanup
- Custom hook patterns

**UX Best Practices:**
- Feedback at every step
- Clear error messages
- Loading states
- Preventing double-clicks
- Transaction history
- Toast notifications

**Debugging Skills:**
- Reading contract errors
- Checking transaction details on Etherscan
- Understanding gas failures
- Wallet connection issues

---

## 📝 **Next Steps**

1. **Before starting:** Make sure Phase 4 is complete
   - Can you read campaigns? ✅
   - Can you see campaign details? ✅
   - Network validation in place? ✅

2. **Start with Step 5.1:**
   - Build the TransactionButton pattern
   - Test with dummy async operation
   - Get comfortable with state management

3. **Then Step 5.2:**
   - Start small: create campaign
   - Get event parsing working
   - Test on testnet

4. **Momentum matters:**
   - Don't skip error handling
   - Each step builds on previous
   - Testing as you go prevents big issues later

---

**You have all the pieces. Time to make it interactive! Let's go! 🚀**

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

### **Step 5.1: Transaction Button Pattern**

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

#### **What You Need to Build**

**Research Questions to Answer:**
- What are wagmi's transaction hooks? (Hint: `useWriteContract`)
- How do you wait for transaction confirmation? (Hint: `useWaitForTransaction`)
- What's the difference between "confirmed" and "1 block confirmation"?
- How do you show a transaction hash to the user?
- Why should you disable the button during transaction?
- How do notifications (toast) work?

**Deliverables for Step 5.1:**

You should create:
1. A `TransactionButton` component that:
   - Takes props: `onClick` handler, `label`, `disabled`
   - Shows different text based on state: "Click me" → "Confirming..." → "Pending..." → "Success!"
   - Disables itself during transaction
   - Shows error message if something fails

2. A hook `useTransactionFlow` that:
   - Manages the state machine above
   - Handles error messages
   - Provides callbacks for success/error
   - Clears state after timeout

3. Example: Make a dummy "Test Transaction" button that:
   - Does a fake async operation (setTimeout 2 seconds)
   - Shows all 4 states
   - Lets you test the UX before real transactions

**Testing Before Moving On:**
- Does the button show "Confirming..." state?
- Does it show a success message?
- Does it re-disable after success?
- Does it handle errors gracefully?

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

#### **Key Technical Challenges**

**Challenge 1: Unit Conversion**
```
User enters: "1.5 ETH"
You need: Send as wei to contract

Question to research:
- What is wei vs ETH?
- How do you convert? (Hint: viem has parseEther)
- What about the reward rate in wei? (Hint: Is it? Check contract!)
```

**Challenge 2: Parsing Events**
```
Transaction sends back a receipt with event logs.
You need to:
- Find the CampaignCreated event in the logs
- Extract campaign address from it
- Don't hardcode the address!

Why is this important?
- What if contract had a bug and emitted wrong address?
- How do you know which event is yours?
```

**Challenge 3: Error Handling**
```
Things that can go wrong:
- User doesn't have enough ETH for gas
- User types invalid data (already validated, but double-check)
- Wallet rejects confirmation
- RPC provider is down
- Contract execution reverts (why would it?)

Research: What's the difference between:
- User rejecting (not an error, just cancelled)
- Gas estimation failing
- Transaction execution failing
```

#### **What You Need to Research**

1. **Viem utilities:**
   - `parseEther(ethString)` - converts "1.5" to bigint wei
   - `decodeEventLog(...)` - parses event logs

2. **Wagmi hooks:**
   - `useWriteContract` - sends a transaction
   - `useWaitForTransaction` - waits for confirmation
   - Together they form the transaction flow

3. **Contract event structure:**
   - What is CampaignCreated event?
   - What data does it contain?
   - How do you find it in logs?

4. **Form validation:**
   - Goal must be > 0
   - Duration must be > 0 and < 365 days (your choice limit)
   - Tokens per ETH must be > 0
   - Check BEFORE sending transaction

#### **Deliverables for Step 5.2**

User should be able to:
1. Fill form (goal in ETH, duration in days, reward rate)
2. Click "Create Campaign"
3. Confirm in wallet
4. See "Transaction pending..." with tx hash (clickable link to Etherscan)
5. Wait for confirmation
6. See "Campaign created successfully!"
7. Auto-redirect to new campaign detail page
8. See their campaign in "My Campaigns" page

**Testing Checklist:**
- [ ] Create campaign with valid data
- [ ] New campaign appears in list
- [ ] Campaign details are correct on detail page
- [ ] Creator address matches connected wallet
- [ ] Deadline is correct (current time + duration seconds)
- [ ] Try creating with invalid data (should be rejected before sending)
- [ ] Try creating with insufficient ETH (should show gas error)

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

#### **What Needs to Happen**

```
Setup (once at beginning):
├─ Admin (factory deployer) has tokens
├─ Admin calls token.approve(factory, bigAmount)
├─ Factory now has permission to transfer tokens on admin's behalf
└─ Now ANY campaign can reward contributors

Per Campaign:
├─ When user contributes
├─ Campaign calls factory.distributeTokens(user, tokenAmount)
├─ Factory calls token.transferFrom(admin, user, tokenAmount)
└─ User receives tokens
```

#### **For Your Implementation**

**Research Questions:**
1. Who is the factory admin?
   - Check your deployed factory: `adminAddress` state variable
   - Should be your wallet address

2. What's an ERC20 "allowance"?
   - How much the admin allows factory to spend
   - Why not just transfer directly?
   - What's the security model?

3. How much allowance to approve?
   - At minimum: sum of all existing campaigns' potential rewards
   - In practice: A large amount (e.g., 1 million tokens)
   - Research: Risks of "infinite approval"

#### **What You Need to Build**

Create an **Admin Dashboard** page (protected - only factory admin):

```
Admin Dashboard (/admin)
├─ Check if user is admin
│  ├─ If not: Show "Access denied, only admin can see this"
│  └─ If yes: Show dashboard
├─ Display:
│  ├─ Current allowance: `token.allowance(admin, factory)`
│  ├─ Token balance: `token.balanceOf(admin)`
│  ├─ Recommendation: Sum of all campaigns' max rewards
│  └─ Status: ✅ Sufficient / ⚠️ Low / ❌ None
├─ Action: "Approve" button
│  ├─ Input field: How much to approve
│  ├─ Preset buttons: "1 Million", "10 Million"
│  └─ Click → Execute token.approve(factoryAddress, amount)
└─ After approval: Show new allowance
```

#### **Deliverables for Step 5.3**

Admin should be able to:
1. Visit `/admin`
2. See current approval status
3. Click "Approve Tokens"
4. Choose amount to approve
5. Confirm in wallet
6. See updated allowance

**Testing Checklist:**
- [ ] Only factory admin can see the page
- [ ] Shows current allowance correctly
- [ ] Can approve new amount
- [ ] Allowance updates after approval
- [ ] Non-admin sees "Access Denied"

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
Validation:
├─ Amount > 0?
├─ Amount <= user's ETH balance?
├─ Deadline not passed?
├─ Campaign state = Funding?
├─ Has admin approved tokens?
└─ All checks pass → Send transaction
     ↓
Send transaction to campaign.contribute() with msg.value = ethAmount
     ↓
In contract:
├─ Record contribution
├─ Transfer tokens via factory
├─ Update totalRaised
├─ If goal reached → state = Successful
└─ Emit Contributed event
     ↓
Wait for confirmation
     ↓
Success: Show "Contributed 0.5 ETH! You earned 50 tokens"
     ↓
Refetch:
├─ User's contribution amount
├─ Campaign totalRaised
├─ Campaign state (might have become Successful)
└─ User's token balance
     ↓
Update UI with new data
```

#### **Key Technical Challenges**

**Challenge 1: Payable Functions**
```
Normal function:
await contract.write.someFunction({ args: [...] })

Payable function (sends ETH):
await contract.write.contribute({
  args: [],
  value: ethAmount  // ← Add this!
})

Research:
- Why do we need value separate from args?
- How does msg.value work in Solidity?
```

**Challenge 2: Live Reward Calculation**
```
User types amount in input → Live update reward

Calculation in contract:
uint256 tokenReward = ((msg.value * 10^18) * rewardRate) / 1 ether;

In JavaScript:
const tokenReward = (ethAmount * 10^18 * rewardRate) / 10^18
// Simplifies to:
const tokenReward = ethAmount * rewardRate

But with decimals/precision:
- What if rewardRate is 100.5?
- How many decimals does the contract use?
- Should you match contract's calculation or simplify?
```

**Challenge 3: Conditional Checks**
```
Before sending transaction, check:
├─ User wallet is connected
├─ User is on correct network
├─ Campaign exists and data loaded
├─ Amount is valid
├─ Campaign state = Funding
├─ Deadline not passed
├─ User balance sufficient
└─ Admin has approved tokens

Some are checked on-chain (contract will revert).
Some should be checked client-side for UX:
- Show "Campaign ended" instead of generic error
- Show "Connect wallet" instead of transaction failing
- Show "Insufficient balance" with helpful UI
```

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

**Why both?**
```
Scenario 1: Goal reached before deadline
├─ Should creator wait until deadline to withdraw?
└─ No! Auto-finalize on contribution allows withdrawal immediately

Scenario 2: Deadline passes, goal not reached
├─ Contract doesn't auto-execute at deadline (blockchains don't have cron)
└─ Someone needs to call finalize() to set state = Failed
└─ Anyone can call it (creator usually, or frontend)
```

#### **When to Show Finalize Button**

On campaign detail page:
```
if (campaign.status === "Funding" && deadline.hasPassed) {
  Show: "Campaign ended. Click to finalize."
  Button: "Finalize"
  After click:
    If totalRaised >= goal → "Campaign Successful!"
    Else → "Campaign Failed"
}
```

#### **What You Need to Research**

1. **Checking deadline:**
   - How to compare current time with deadline?
   - What's the time source (client-side vs contract)?
   - Why should contract re-check deadline?

2. **Optimistic vs pessimistic updates:**
   - Should you assume state will change?
   - Or wait for confirmation?

#### **Deliverables for Step 5.5**

User should be able to:
1. See "Finalize" button when deadline passed
2. Click button
3. Confirm in wallet
4. See campaign state change:
   - If goal reached: "Successful"
   - If goal not reached: "Failed"
5. Creator can then withdraw (if successful)
6. Contributors can refund (if failed)

**Testing Scenarios:**
- [ ] Campaign reaches goal during contributions → Auto-successful
- [ ] Campaign doesn't reach goal → Need to finalize manually
- [ ] Try finalizing before deadline (should fail)
- [ ] Different users see same final state

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

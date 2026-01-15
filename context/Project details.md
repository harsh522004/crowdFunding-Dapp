# CrowdFunding DApp — Project details (based on your contracts)

This document defines the DApp we’ll build to communicate with:
- `CampaignProxyFactory` (factory that deploys clones)
- `CrowdFundingMaster` (the per-campaign contract)

It is written for your current level (beginner-to-intermediate Web3 + React).

---

## 0) What the contracts actually do (so the UI matches reality)

### A. Factory contract: `CampaignProxyFactory`
**Purpose:** deploy new campaign instances as cheap clones.

**What the DApp must support:**
- Create a new campaign clone: `createClone(goal, durationSeconds, tokensPerEth, tokenAdress)`
- List campaigns:
  - `getAllCampaigns()`
  - `getCompaignsOf(creator)`
  - `compaignsCount()`
  - `getRecent(n)` (⚠️ only safe when `n <= compaignsCount()`)

**Event you can use in UI/indexing:**
- `CompaignCreated(compaign, creator, goal, deadline)`

### B. Campaign contract: `CrowdFundingMaster` (clone)
**Purpose:** accept ETH contributions until deadline / goal; reward contributors with ERC20 tokens; allow withdraw/refund.

**Functions the DApp must support:**
- Read-only (currently available):
  - `token()`
  - `rewardRate()`
- Transactions:
  - `contribute()` (payable)
  - `finalize()`
  - `withdraw()` (creator only, only when successful)
  - `refund()` (contributors only, only when failed)

**Events you can use in UI/indexing:**
- `CampaignCreated(creator, goal, deadline)`
- `Contributed(contributor, amount, newTotal, IsSucess, tokenReward)`
- `Withdrawn(creator, amount)`
- `Refund(banker, amount)`

### C. Important contract constraints (affects UX)
1) **Token reward requires ERC20 allowance from the creator**
   - In `contribute()`, the campaign calls:
     - `token.transferFrom(owner(), contributor, tokenReward)`
   - Here `owner()` is the campaign creator.
   - That means: **before anyone can contribute successfully, the creator must approve the campaign contract to spend enough reward tokens**.

2) **Most campaign fields are not readable by the frontend right now**
   - `goal`, `deadline`, `totalRaised`, and `state` are inside a `struct` with a `mapping` and are **not exposed with view functions**.
   - So the UI has two options:

   **Option A (recommended for learning + simplest UI):** add view functions and redeploy
   - Add a `getSummary()` style read method (creator/goal/deadline/totalRaised/state/isWithdrawn/token/rewardRate)
   - Add `getContribution(address user)`

   **Option B (no contract changes):** reconstruct the state from events
   - Use `CompaignCreated/CampaignCreated` to get goal/deadline
   - Use `Contributed` events to compute totalRaised
   - Use `Withdrawn`/`Refund` events to compute final outcomes

   We’ll design the DApp so it can start with Option A, but we’ll also describe how Option B works because it’s a valuable Web3 skill.

---

## 1) App roles & core user stories

### Roles
- **Visitor**: can browse campaigns (read-only) without wallet.
- **Contributor**: connects wallet, contributes ETH, may request refund if campaign fails.
- **Creator**: creates campaigns, approves reward tokens, withdraws raised ETH if successful.

### Core stories
- As a visitor, I can see a list of campaigns and open a campaign.
- As a creator, I can create a campaign and then enable token rewards by approving the campaign contract.
- As a contributor, I can contribute ETH and see the token reward I’ll receive.
- As a creator, I can withdraw ETH once the campaign succeeds.
- As a contributor, I can refund if the campaign fails after deadline.

---

## 2) Information architecture (pages)

Keep pages minimal and aligned to your contract.

### Page 1 — **Home / Explore campaigns**
**Purpose:** list all campaigns and let users open details.

**Data shown per campaign (minimum):**
- Campaign address
- Creator address (from event or view)
- Goal (from event or view)
- Deadline timestamp (from event or view)
- Total raised (from view, or computed from `Contributed` events)
- Status badge (Funding / Successful / Failed / Withdrawn)

**Primary actions:**
- Connect wallet (optional, global header)
- Open campaign detail
- Go to “Create campaign”
- Go to “My campaigns”

**Contract interactions:**
- Read factory campaign addresses:
  - `getAllCampaigns()` OR `getRecent(n)` (only after checking `compaignsCount()`)
- For each campaign, read summary (Option A) OR query logs (Option B)

**Edge cases UI must handle:**
- No campaigns exist
- `getRecent(n)` called with `n > count` must be prevented client-side
- Wrong network connected

---

### Page 2 — **Create campaign**
**Purpose:** creator deploys a new clone campaign.

**Form inputs (matching `createClone`)**
- `goal` (in ETH, convert to wei)
- `durationSeconds` (UI can accept days/hours but must convert)
- `tokenAddress` (ERC20 used for rewards)
- `tokensPerEth` (rewardRate)

**Validations (frontend):**
- Goal > 0
- Duration > 0
- Token address is a valid address
- `tokensPerEth` > 0

**Transaction flow:**
1) User submits → call factory `createClone(...)`
2) Wait for tx confirmation
3) Discover new campaign address
   - easiest: parse `CompaignCreated` event from tx receipt
4) Redirect to Campaign detail page

**Critical next-step UX (because of your `transferFrom`)**
After creation, show a clear “Enable rewards” step:
- Explain that contributions will revert until the creator approves token allowance to the campaign contract.
- Provide “Approve rewards” CTA that calls ERC20 `approve(campaignAddress, allowanceAmount)`.

**Allowance UX policy (keep it safe and simple):**
- For learning, prefer allowing the creator to choose an allowance amount.
- Explain risks of “infinite approval”.

---

### Page 3 — **My campaigns**
**Purpose:** creator sees campaigns they created.

**Contract interactions:**
- Factory: `getCompaignsOf(address)` using the connected wallet address.

**Shown data & actions per campaign:**
- Same campaign summary as Explore
- Show “Approve rewards” (if allowance insufficient or unknown)
- Show “Withdraw” (only if successful and not withdrawn)
- Show “Finalize” (only if deadline passed and not finalized)

**Why this page matters:**
- It keeps creator-only actions out of the public list and makes the creator workflow clearer.

---

### Page 4 — **Campaign detail**
**Purpose:** single campaign page for contributors + creator.

**Data shown:**
- Campaign address
- Creator address
- Goal
- Deadline (and a countdown)
- TotalRaised
- Status
- Token info: token address; rewardRate (`tokensPerEth`)

**Contributor section:**
- Input contribution amount (ETH)
- Display estimated token reward:
  - tokenReward = contributionEth * tokensPerEth
  - Show note about token decimals (we’ll handle decimals properly in implementation)
- CTA: “Contribute”

**Creator section (only if connected wallet == creator):**
- “Approve rewards” (ERC20 approve)
- “Finalize” (after deadline)
- “Withdraw” (if successful)

**Refund section (only if failed and user contributed):**
- “Refund”

**Contract interactions (Option A):**
- campaign `getSummary()` (if you add it)
- campaign `getContribution(user)` (if you add it)

**Contract interactions (Option B):**
- Read logs:
  - from factory/campaign creation events to get goal/deadline/creator
  - all `Contributed` logs to compute totalRaised
  - filter `Contributed(contributor==user)` to compute user’s contribution
  - detect Withdrawn/Refund

**Important UX states:**
- Wallet not connected → show read-only + connect prompt
- Wrong network → show switch prompt
- Tx lifecycle per action:
  - preparing → wallet confirmation → pending → confirmed → error/reverted

---

## 3) Global app behaviors (non-page-specific)

### Wallet & network
- Connect wallet (MetaMask + WalletConnect).
- Show current chain, account, and balance.
- Validate the chainId is correct for your deployment.

### Transaction UX
For any write action (create, approve, contribute, finalize, withdraw, refund), always show:
- What the transaction will do (human description)
- Approximate value sent (for contribute)
- Pending state and block confirmation
- Error state with revert reason (if available)

### Formatting rules
- ETH values: show both ETH and (optionally) wei in debug.
- Addresses: shorten + copy button.
- Timestamps: local time + relative countdown.

---

## 4) Minimal data model (frontend-side)

Define a “CampaignCard” view model used in lists and details:
- `address`
- `creator`
- `goalWei`
- `deadline`
- `totalRaisedWei`
- `status` (Funding/Successful/Failed/Withdrawn)
- `tokenAddress`
- `tokensPerEth`
- `userContributionWei` (if wallet connected)
- `creatorAllowance` (optional but useful)

---

## 5) Security + correctness notes (things your UI must respect)

- Never call `getRecent(n)` without checking `compaignsCount()`.
- Don’t assume the token has 18 decimals; fetch `decimals()` for display math.
- Contributions can revert if creator didn’t approve reward tokens: surface this clearly.
- “Finalize” can revert if deadline not passed; only show button when deadline passed.
- “Withdraw” can revert if not successful or already withdrawn; guard with status.

---

## 6) Deliverables (what you’ll end up with)

- A React DApp with 4 pages: Explore, Create, My campaigns, Campaign detail.
- Wallet connection + network validation.
- Full read + write interaction with your factory and campaign contracts.
- Clear creator workflow for token approvals (required by your current contract design).

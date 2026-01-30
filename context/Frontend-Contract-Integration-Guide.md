# Step 4 — Frontend ↔ Contract Integration (Implementation Playbook)

This is the **implementation-ordered guide** to take your current UI (mock data) to a fully working DApp.

Goal (end state):
- Home page reads campaigns from Factory and renders real cards
- Campaign detail page reads one campaign + (optionally) user contribution
- Create campaign, contribute, finalize, withdraw/refund write transactions with clean UX states

Stack assumptions (your current setup):
- React 18 + Vite + TypeScript
- wagmi v2 + viem + RainbowKit

Important rule:
- We will not “sprinkle contract reads inside components”.
- Components should render **UI-shaped types**.
- Hooks should return **contract-shaped raw data** + mapped UI data.

---

## Part A — One-time setup (do this before HomePage)

### A1) Create a single contract config module

What you do
1. Pick one file as the source of truth for addresses and chain.
2. Export:
  - `CHAIN_ID` (Sepolia = `11155111`)
  - `FACTORY_ADDRESS`
  - Any other addresses your UI needs (token address if you display it)

Standard output
- Your whole frontend imports addresses from exactly one place.

Done when
- You can change Factory address in one file and everything follows.

Hints
- You already have `src/contracts/config.ts`. Keep it there.

---

### A2) Create contract “domain types” (Raw vs UI)

What you do
1. Create a “raw” type that mirrors exactly what `getCompaignDetails()` returns.
2. Create a “UI” type that your components will render.

Standard output
- `CampaignDetailsRaw` (contract shaped)
- `Campaign` (UI shaped) includes `address`

Done when
- You can render a card with **only** a `Campaign` object.

Hints (standard viem types)
- Use `Address` type from `viem` for addresses.
- Use `bigint` for uint values.

Recommended file placement
- `src/features/campaigns/types.ts`

---

### A3) Create 2 pure helpers (no React)

What you do
1. `mapCampaignDetails(address, raw) -> Campaign` (pure function)
2. `campaignStateToLabel(state) -> "Funding" | ...` (pure function)

Standard output
- All formatting lives in helpers, not in components.

Done when
- You can test the mapper by manually passing sample values.

Recommended file placement
- `src/features/campaigns/mappers.ts`

---

## Part B — HomePage-first (Reads)

You requested a concrete, standard flow starting from HomePage. This is it.

### B1) Hook 1: read campaign addresses from Factory

Create
1. A hook: `useCampaignAddresses()`

What it does
- Calls the Factory read method that returns campaign addresses.
- Returns a predictable shape:
  - `addresses` (array)
  - `isLoading`
  - `isError`
  - `error`
  - `refetch`

Standard decisions
- Use `useReadContract` (wagmi v2) for a single read.
- Guard with `enabled` so it doesn’t query with missing config.

Where
- `src/features/campaigns/hooks/useCampaignAddresses.ts`

Done when
- HomePage can render a list of addresses (even as plain text).

Hints
- If your Factory function name differs (e.g. `getDeployedCampaigns`, `getAllClones`, etc.), use your ABI as the source of truth.

---

### B2) Hook 2: read campaign details in batch (N calls, one hook)

Create
1. A hook: `useCampaignDetailsBatch(addresses)`

What it does
- Takes `addresses: Address[]`
- Builds a `contracts[]` array where each item calls `getCompaignDetails()` on that address
- Uses `useReadContracts` (wagmi v2) to fetch all details

Standard output
- `detailsRawByAddress: Map<Address, CampaignDetailsRaw>` OR an array aligned by index
- `isLoading`
- `isError`
- `error`
- `refetch`

Standard decisions
- Prefer batch reads to avoid “waterfall” loading per card.
- Keep mapping logic outside the hook if it becomes complex.

Where
- `src/features/campaigns/hooks/useCampaignDetailsBatch.ts`

Done when
- You can log the raw tuple output for at least 1 address.

Hints
- `getCompaignDetails()` is misspelled in Solidity; you must use the exact ABI name.

---

### B3) Hook 3: compose UI-ready campaigns for HomePage

Create
1. A hook: `useCampaignsForHome()`

What it does
1. Calls `useCampaignAddresses()`
2. Calls `useCampaignDetailsBatch(addresses)`
3. Maps each address+rawDetails into a `Campaign` UI object using `mapCampaignDetails`

Standard output
- `campaigns: Campaign[]`
- Combined loading/error states

Where
- `src/features/campaigns/hooks/useCampaignsForHome.ts`

Done when
- HomePage renders real `CampaignCard`s using real chain data.

---

### B4) Update HomePage to use the new Home hook

Modify
1. Home page component (your existing page)

What you do
1. Replace mock data usage with `useCampaignsForHome()`.
2. Render 4 UI states:
  - Loading: show skeleton cards
  - Error: show a clear message + “Retry” calls refetch
  - Empty: show empty state (0 campaigns)
  - Success: render `CampaignCard` list

Standard output
- HomePage becomes your “gold standard” for read states.

Done when
- Switching to wrong chain shows your wrong-network UX, and correct chain shows campaigns.

---

### B5) Refactor CampaignCard props (standard UI boundary)

Modify
1. `CampaignCard` props should accept a `Campaign` UI type (not raw tuples)

What you do
1. Update card component signature to accept one object.
2. Ensure the card uses:
  - `campaign.address`
  - `campaign.goalEth` (string)
  - `campaign.totalRaisedEth` (string)
  - `campaign.stateLabel`
  - `campaign.progressPct`

Done when
- You can reuse `CampaignCard` on Home + MyCampaigns page with the same props.

---

## Part C — Campaign Detail Page (Reads + wallet-conditional read)

### C1) Parse and validate route param address

Modify
1. Campaign detail page

What you do
1. Read `address` from route params.
2. Validate it using viem (`isAddress`).
3. If invalid → show a “Bad address” UI, and DO NOT call the contract.

Done when
- Navigating to `/campaign/hello` shows a nice error state.

---

### C2) Hook: read single campaign details

Create
1. `useCampaignDetails(address)`

What it does
- Calls `getCompaignDetails()` on the campaign contract at that address.

Standard output
- `raw` + mapped `campaign`
- loading/error/refetch

Done when
- Detail page shows real details for the route address.

Hints
- You already have a `src/hooks/useCampaignDetails.ts`. You can replace/refactor it into the feature folder pattern, or keep it and gradually migrate.

---

### C3) Hook: read connected user contribution (conditional)

Create
1. `useUserContribution(campaignAddress)`

What it does
1. Reads wallet address from `useAccount()`
2. If connected, calls `getContributionOf(userAddress)`
3. If not connected, stays idle

Standard output
- `contributionWei?: bigint`
- `contributionEth?: string`
- loading/error

Done when
- Not connected: section shows “Connect wallet to see your contribution”.
- Connected: section shows your contribution.

---

## Part D — Create Campaign (Write #1)

This is the first write to implement because it’s the cleanest: form inputs → tx → new campaign appears.

### D1) Create a dedicated write hook for create-campaign

Create
1. `useCreateCampaign()`

What it does
1. Accepts validated inputs (token address, goal, deadline, rewardRate, etc. depending on your Factory signature)
2. Uses `useWriteContract` to send tx
3. Uses `useWaitForTransactionReceipt` to await confirmation

Standard output
- `createCampaign(values)` function
- `status: 'idle' | 'submitting' | 'confirming' | 'success' | 'error'`
- `txHash`
- `error`

Done when
- You can submit the tx and see it mined.

Hints
- Keep form validation in the page.
- Keep tx orchestration inside the hook.

---

### D2) Update CreateCampaignPage to use the write hook

Modify
1. Create campaign page

What you do
1. Keep your existing form UI.
2. On submit:
  - Validate fields
  - Call `createCampaign(...)`
3. Show UX states:
  - Disabled submit button while submitting/confirming
  - Show tx hash link on success
  - Show friendly error on failure

Standard output
- After success, user can go to HomePage and see the campaign (after refetch).

---

## Part E — Contribute flow (Write #2) + Token Approval reality

This is where most DApps break if not designed carefully.

### E1) Write down your “truth table” before coding

Do this first (no code)
1. For your exact contracts, write the rules:
  - Who approves tokens (admin/creator/contributor)?
  - Who is the spender? (campaign contract vs factory contract)
  - Which function uses `transferFrom` and from which address?

Done when
- You can answer: “If contribute fails, which allowance is missing?”

---

### E2) Implement the UI as two steps (standard UX)

Create
1. `useAllowance(owner, spender)` read hook (ERC20)
2. `useApproveToken(spender)` write hook (ERC20)
3. `useContribute(campaignAddress)` write hook

What you do
1. On CampaignDetailPage, for the contribution amount input:
  - Calculate required allowance (based on your contract logic)
  - If allowance insufficient → show “Approve” button first
  - After approval confirmed → show “Contribute” enabled

Done when
- User experience is guided, not confusing.

Hints
- If approval is not done by the contributor in your design, your UI must clearly state who must do it and why.

---

## Part F — Finalize / Withdraw / Refund (Writes)

Create
1. `useFinalize(campaignAddress)`
2. `useWithdraw(campaignAddress)`
3. `useRefund(campaignAddress)`

Modify
1. Campaign detail page action panel

Standard decisions
- Determine action visibility using campaign state + deadline + connected wallet role (creator/admin/user)
- For each action, show:
  - disabled reason (tooltip/text)
  - tx status
  - refetch after success

Done when
- Successful campaign: finalize then withdraw works.
- Failed campaign: refund works.

---

## Part G — Standard refetch strategy (don’t skip)

After every successful write, the UI must update.

Standard approach
1. On write success, refetch the minimum reads needed:
  - Home: campaign list + batch details
  - Detail: campaign details + contribution + allowance

Done when
- You do not need to refresh the browser to see new data.

---

## End-to-end completion checklist (in the order you’ll implement)

1) HomePage reads addresses
2) HomePage renders cards with real details
3) Detail page shows real details (route param)
4) Detail page shows user contribution (if connected)
5) Create campaign write works
6) Contribute flow works (including required approvals)
7) Finalize/withdraw/refund work with correct conditional UI

---

## What I need from you to make this guide 100% concrete for YOUR ABI

Paste these and I’ll update the steps with exact function names + parameters:

1. Sepolia Factory address
2. Factory function name that returns campaign addresses
3. Factory function signature for creating a campaign (name + params)
4. The exact output tuple of `getCompaignDetails()` (order)

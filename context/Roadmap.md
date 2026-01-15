CrowdFunding DApp Learning Roadmap
-----------------------------------

### *From Beginner to Builder: A Mentored Journey*

* * * * *

🎯 Roadmap Philosophy
---------------------

**This is NOT a tutorial. This is a mentorship framework.**

-   You research → You implement → I review
-   Each phase builds one skill at a time
-   Questions are encouraged at every step
-   We validate together before moving forward
-   Learning > Speed

**Your Success Metrics:**

-   ✅ Application works end-to-end on testnet
-   ✅ You understand *why* each piece exists
-   ✅ You can explain the code to someone else
-   ✅ You've debugged and fixed problems yourself

* * * * *

📊 Project Scope Overview
-------------------------

**What You're Building:**

-   4-page React DApp that interacts with your factory + campaign contracts
-   Wallet connection (MetaMask)
-   Full read/write contract interactions
-   Campaign creation → Token approval → Contribution → Withdrawal/Refund flow

**Technology Stack (Modern & Job-Ready):**

-   **Smart Contracts:** Solidity 0.8.18, OpenZeppelin, Hardhat
-   **Frontend:** React 18 + Vite, React Router v6
-   **Web3:** ethers.js v6 + wagmi + RainbowKit
-   **Styling:** Tailwind CSS + shadcn/ui
-   **Network:** Sepolia testnet

**Timeline:** 8-12 weeks (2-3 hours/day, 4-5 days/week)

* * * * *

🚀 Phase 1: Smart Contract Deployment & Manual Testing
------------------------------------------------------

**Duration:** 1.5-2 weeks\
**Goal:** Deploy your contracts to Sepolia and experience the full flow manually

### What You'll Learn

-   Hardhat project structure
-   Deployment scripts
-   Testnet interaction
-   **The token approval problem** (you'll feel the pain before building the solution!)

### Steps to Complete

#### Step 1.1: Environment Setup

**Tasks:**

1.  Install Hardhat in a new `contracts/` folder
2.  Set up project structure (contracts/, scripts/, test/)
3.  Copy your Factory and Master contract code
4.  Install OpenZeppelin contracts
5.  Configure `hardhat.config.js` for Sepolia

**Research Topics:**

-   Hardhat vs Foundry (understand the difference)
-   Environment variables (.env file for private keys - NEVER commit this!)
-   Hardhat networks configuration
-   Alchemy or Infura RPC providers

**Deliverables to Review with Me:**

-   Working Hardhat project that compiles
-   Sepolia configuration ready
-   Screenshots of successful compilation

* * * * *

#### Step 1.2: Deploy a Test ERC20 Token

**Why:** Your campaigns need reward tokens. You need your own test token to approve.

**Tasks:**

1.  Create a simple ERC20 token contract (use OpenZeppelin template)
2.  Write deployment script for this token
3.  Deploy to Sepolia
4.  Mint yourself 1,000,000 tokens
5.  Verify contract on Etherscan

**Research Topics:**

-   ERC20 token standard
-   OpenZeppelin ERC20 implementation
-   Hardhat deployment scripts
-   Etherscan verification

**Deliverables:**

-   Deployed token address
-   Etherscan link showing your token balance
-   Explanation: What does `decimals` mean in ERC20?

* * * * *

#### Step 1.3: Deploy Factory & Create First Campaign

**Tasks:**

1.  Write deployment script for Factory
2.  Deploy Factory to Sepolia
3.  Using Etherscan's "Write Contract" interface:
    -   Call `createClone(...)` with your test token
    -   Get the new campaign address from the event
4.  Add the campaign address to MetaMask as a watchlist

**Research Topics:**

-   EIP-1167 Minimal Proxy (why your Factory uses Clones)
-   Gas costs: clone vs full deployment
-   How to read event logs on Etherscan

**Deliverables:**

-   Factory contract address
-   First campaign address
-   Answers: Why use a factory? What's a proxy clone?

* * * * *

#### Step 1.4: Manual Testing - The Full Flow

**This is CRITICAL for understanding the UX challenges.**

**Tasks (Do in Order):**

1.  **Approve Tokens:**

    -   Go to your ERC20 token on Etherscan
    -   Call `approve(campaignAddress, 10000e18)`
    -   *Why we do this:* Understand this BEFORE building UI!
2.  **Contribute:**

    -   Send 0.01 ETH to campaign via `contribute()`
    -   Check the `Contributed` event
    -   Verify you received reward tokens
3.  **Try to Contribute Without Approval:**

    -   Create a second campaign
    -   Try to contribute WITHOUT approving first
    -   **Observe the transaction revert**
    -   This teaches why the UI must guide users!
4.  **Test Deadline & Finalize:**

    -   Wait for deadline OR create a campaign with 5-minute duration
    -   Call `finalize()`
    -   Observe state change
5.  **Withdraw (if successful):**

    -   Call `withdraw()` as creator
    -   Check your ETH balance increased
6.  **Refund (create a failed campaign):**

    -   Create campaign with high goal
    -   Contribute small amount
    -   Wait for deadline
    -   Finalize
    -   Call `refund()`

**Research Topics:**

-   Solidity `payable` functions
-   `transferFrom` vs `transfer` for ERC20
-   Why `finalize()` is needed (state transitions)

**Deliverables to Review:**

-   Screenshots/transaction hashes for each step
-   Written answer: "Why does contribute() fail without token approval?"
-   A description of one problem you encountered and how you debugged it

**Questions to Reflect On (We'll Discuss):**

-   What was confusing about the token approval step?
-   How would you explain this to a non-technical user?
-   What UI warnings would have helped you?

* * * * *

🎨 Phase 2: Frontend Foundation (No Web3 Yet)
---------------------------------------------

**Duration:** 1 week\
**Goal:** Build the UI structure and routing before adding blockchain complexity

### What You'll Learn

-   Modern React project setup (Vite)
-   React Router v6.4+ with loaders
-   Tailwind CSS
-   Component architecture

### Steps to Complete

#### Step 2.1: Project Initialization

**Tasks:**

1.  Create new Vite + React + TypeScript project (TypeScript is optional but recommended)
2.  Install dependencies:
    -   `react-router-dom`
    -   Tailwind CSS
    -   `date-fns` (for date formatting)
    -   `lucide-react` (icons)
3.  Set up Tailwind configuration
4.  Create basic folder structure:

**Research Topics:**

-   Vite vs Create React App (why Vite is faster)
-   Tailwind utility-first CSS
-   TypeScript benefits (optional - you can use plain JavaScript)

**Deliverables:**

-   Running dev server
-   Screenshot of "Hello World" with Tailwind styling

* * * * *

#### Step 2.2: Set Up Routing & Page Structure

**Tasks:**

1.  Create 4 page components (empty for now):
    -   `HomePage.jsx` - Campaign list
    -   `CreateCampaignPage.jsx` - Create new campaign
    -   `MyCampaignsPage.jsx` - User's campaigns
    -   `CampaignDetailPage.jsx` - Single campaign view
2.  Set up React Router with these routes:
    -   `/` → HomePage
    -   `/create` → CreateCampaignPage
    -   `/my-campaigns` → MyCampaignsPage
    -   `/campaign/:address` → CampaignDetailPage
3.  Create a `Layout` component with navigation:
    -   Logo/title
    -   Nav links (Home, Create, My Campaigns)
    -   Placeholder "Connect Wallet" button (not functional yet)

**Research Topics:**

-   React Router v6 nested routes
-   URL parameters (`:address`)
-   `useNavigate` and `useParams` hooks

**Deliverables:**

-   Working navigation between all 4 pages
-   Clean header/layout
-   Explain: How does React Router match `/campaign/0x123...` to the detail page?

* * * * *

#### Step 2.3: Build Static Campaign Card Component

**Tasks:**

1.  Create `CampaignCard` component that displays (with mock data):
    -   Campaign address (shortened: `0x1234...5678`)
    -   Creator address (shortened)
    -   Goal (e.g., "5 ETH")
    -   Deadline (formatted: "Jan 20, 2026, 3:45 PM")
    -   Progress bar (totalRaised / goal)
    -   Status badge (Funding / Successful / Failed)
2.  Add a "View Details" button that links to `/campaign/:address`
3.  Style it nicely with Tailwind
4.  Use multiple cards on `HomePage` with different mock data

**Research Topics:**

-   Tailwind flexbox/grid
-   Progress bars (can use `shadcn/ui` Progress component)
-   Date formatting with `date-fns`
-   Address formatting (create a utility: `shortenAddress()`)

**Deliverables:**

-   3-4 mock campaign cards displayed on homepage
-   Clicking "View" navigates to detail page
-   A `utils/formatters.js` file with:
    -   `shortenAddress(address)` → "0x1234...5678"
    -   `formatDate(timestamp)` → readable date

* * * * *

#### Step 2.4: Build Create Campaign Form

**Tasks:**

1.  Create form in `CreateCampaignPage` with inputs:
    -   Goal (ETH)
    -   Duration (days or hours - you choose)
    -   Token Address
    -   Tokens Per ETH
2.  Add client-side validation:
    -   All fields required
    -   Goal > 0
    -   Duration > 0
    -   Token address looks like an address (starts with 0x, 42 chars)
3.  Add a "Create Campaign" button (not functional yet)
4.  Display validation errors under each field

**Research Topics:**

-   React controlled components
-   Form validation patterns
-   Regex for Ethereum addresses (`/^0x[a-fA-F0-9]{40}$/`)

**Deliverables:**

-   Working form with validation
-   Screenshot showing error messages
-   Question: Why validate on frontend if the contract will validate too?

* * * * *

#### Step 2.5: Build Campaign Detail Page Layout

**Tasks:**

1.  Create layout for `CampaignDetailPage` with sections (mock data):
    -   **Header:** Address, creator, status badge
    -   **Stats:** Goal, deadline, total raised, progress bar
    -   **Contribute Section:**
        -   Input for contribution amount
        -   Display calculated token reward
        -   "Contribute" button
    -   **Creator Actions** (show only if creator):
        -   "Approve Tokens" button
        -   "Finalize Campaign" button
        -   "Withdraw Funds" button
    -   **Contributor Actions:**
        -   "Request Refund" button (show if failed)
2.  Use conditional rendering to show/hide sections based on role
3.  Add a countdown timer (mock or real using `date-fns`)

**Research Topics:**

-   Conditional rendering patterns
-   Countdown timers with `setInterval`
-   Tailwind grid layouts

**Deliverables:**

-   Polished campaign detail page
-   All sections visible (we'll add conditional logic later)
-   A working countdown to a future date

* * * * *

#### Step 2.6: Polish & Review

**Tasks:**

1.  Add loading states (skeleton screens or spinners)
2.  Add "empty states" (e.g., "No campaigns yet" on homepage)
3.  Make responsive (mobile + desktop)
4.  Add hover effects, transitions

**Research Topics:**

-   Skeleton loaders
-   Responsive design with Tailwind
-   Accessibility basics (semantic HTML, keyboard nav)

**Deliverables:**

-   Fully styled, responsive static UI
-   Works on mobile screen size
-   We review together - I'll give UX feedback

**Phase 2 Complete! 🎉**\
*You now have a professional-looking UI. In Phase 3, we connect to the blockchain.*

* * * * *

🔌 Phase 3: Wallet Connection
-----------------------------

**Duration:** 3-5 days\
**Goal:** Connect MetaMask and display user's account & network

### What You'll Learn

-   Web3 providers and signers
-   wagmi + RainbowKit setup
-   Network management
-   React Context for wallet state

### Steps to Complete

#### Step 3.1: Install wagmi + RainbowKit

**Why wagmi:** It handles 90% of wallet complexity. Don't reinvent the wheel!

**Tasks:**

1.  Install wagmi, viem, RainbowKit, and dependencies
2.  Follow RainbowKit setup guide:
    -   Wrap your app in `WagmiConfig` and `RainbowKitProvider`
    -   Configure for Sepolia testnet
    -   Add supported wallets (MetaMask, WalletConnect, etc.)
3.  Replace your placeholder "Connect Wallet" button with `<ConnectButton />`
4.  Test connection with MetaMask

**Research Topics:**

-   What is a Web3 provider?
-   What is a signer?
-   EIP-1193 (wallet communication standard)
-   wagmi vs ethers.js (understand the abstraction layers)

**Deliverables:**

-   Screenshot of wallet connection modal
-   Connected account displayed in header
-   Explain: What's the difference between a provider and a signer?

* * * * *

#### Step 3.2: Create Wallet Context

**Tasks:**

1.  Create `WalletContext.jsx` using React Context
2.  Use wagmi hooks:
    -   `useAccount()` - Get connected address & status
    -   `useNetwork()` - Get current chain
    -   `useBalance()` - Get ETH balance
3.  Provide this state to your app
4.  Display in header:
    -   Connected address (shortened)
    -   Network name
    -   ETH balance
5.  Add a "wrong network" warning if not on Sepolia

**Research Topics:**

-   React Context API (you already know this!)
-   wagmi hook composition
-   Chain IDs (Sepolia = 11155111)

**Deliverables:**

-   Header shows: `0x1234...5678 | Sepolia | 0.45 ETH`
-   If connected to mainnet, shows warning: "Please switch to Sepolia"
-   Code walkthrough with me: explain how `useAccount` works

* * * * *

#### Step 3.3: Add Network Switching

**Tasks:**

1.  Use `useSwitchNetwork()` hook from wagmi
2.  Add a "Switch to Sepolia" button in the network warning
3.  Handle the switch request
4.  Test with MetaMask

**Research Topics:**

-   EIP-3326 (wallet_switchEthereumChain)
-   Programmatic network switching

**Deliverables:**

-   Button that triggers MetaMask network switch
-   Screenshot of MetaMask prompt

* * * * *

#### Step 3.4: Conditional UI Based on Wallet State

**Tasks:**

1.  On `CreateCampaignPage` and `MyCampaignsPage`:
    -   If wallet not connected → Show "Connect wallet to continue"
    -   If connected → Show content
2.  On `CampaignDetailPage`:
    -   Compare connected address with campaign creator
    -   Show creator-only buttons only if match
    -   Show "Connect wallet to contribute" if not connected
3.  Test all scenarios:
    -   Not connected
    -   Connected, wrong network
    -   Connected, correct network

**Deliverables:**

-   All pages handle wallet states gracefully
-   Screenshots of each state
-   Question: Why do we check wallet state in the UI if the contract will check too?

**Phase 3 Complete! 🎉**\
*You're now connected to the blockchain. Time to READ contract data.*

* * * * *

📖 Phase 4: Reading Contract Data
---------------------------------

**Duration:** 1-1.5 weeks\
**Goal:** Fetch and display real campaign data from your deployed contracts

### What You'll Learn

-   ABIs (the contract's API)
-   Contract read operations
-   React hooks for async Web3 calls
-   Error handling

### Decision Point: View Functions or Events?

**Before starting, decide together:**

-   **Option A:** Add `getSummary()` and `getContribution()` view functions to your contracts and redeploy (RECOMMENDED FOR FIRST PROJECT)
-   **Option B:** Parse events to reconstruct state (advanced, teaches event indexing)

*Let's assume Option A for this roadmap. We can discuss Option B later.*

* * * * *

#### Step 4.1: Add View Functions to Contracts

**Tasks:**

1.  Modify `CrowdFundingMaster.sol` to add:
2.  Redeploy Factory and Master to Sepolia
3.  Create a new test campaign
4.  Call `getSummary()` on Etherscan to verify it works

**Research Topics:**

-   Solidity view functions
-   Multiple return values

**Deliverables:**

-   Updated contract code
-   New deployed addresses
-   Etherscan screenshot showing `getSummary()` output
-   Explanation: Why wasn't this included originally?

* * * * *

#### Step 4.2: Export ABIs to Frontend

**Tasks:**

1.  After compilation, Hardhat creates ABIs in `artifacts/` folder
2.  Copy ABIs to your React project:
    -   Create `src/contracts/` folder
    -   Copy `CampaignProxyFactory.json` and `CrowdFundingMaster.json`
    -   Extract just the `abi` field (you don't need full artifact)
3.  Create `src/contracts/config.js`:

**Research Topics:**

-   What is an ABI?
-   Why does the frontend need it?
-   How does the ABI encode function calls?

**Deliverables:**

-   ABIs in frontend project
-   Config file with contract addresses
-   Question: What would happen if the ABI doesn't match the deployed contract?

* * * * *

#### Step 4.3: Read Campaign List from Factory

**Tasks:**

1.  On `HomePage`, use wagmi's `useContractRead`:
2.  Display the array of addresses
3.  Add error handling (what if read fails?)
4.  Add loading state

**Research Topics:**

-   wagmi `useContractRead` hook
-   Why reads don't cost gas
-   RPC calls under the hood

**Deliverables:**

-   Homepage displays real campaign addresses from your deployed factory
-   Loading spinner while fetching
-   Error message if RPC fails
-   Explain: Where is this data coming from? (hint: RPC node)

* * * * *

#### Step 4.4: Read Campaign Details for Each Card

**Tasks:**

1.  For each campaign address, call `getSummary()`
2.  Create a custom hook `useCampaignSummary(address)`:
3.  Use this hook in `CampaignCard` component
4.  Replace mock data with real data
5.  Handle the State enum (0 = Funding, 1 = Successful, 2 = Failed, 3 = Withdrawn)

**Research Topics:**

-   Custom React hooks
-   Solidity enums (how they serialize)
-   BigNumber handling (goal, totalRaised are BigNumbers)

**Deliverables:**

-   Homepage shows REAL campaigns with REAL data
-   Status badges reflect actual contract state
-   Progress bar shows actual totalRaised/goal
-   Code review: I'll check how you handle BigNumber conversion

* * * * *

#### Step 4.5: Campaign Detail Page Data

**Tasks:**

1.  Get `address` from URL using `useParams()`
2.  Call `getSummary()` for this campaign
3.  If wallet connected, call `getContribution(userAddress)`
4.  Display all data on detail page:
    -   Convert wei to ETH for display (use `formatEther`)
    -   Show deadline as readable date
    -   Show countdown if still active
    -   Show user's contribution amount
5.  Calculate and show token reward for contribution input:

**Research Topics:**

-   ethers.js `formatEther` and `parseEther`
-   BigNumber math (multiply, divide)
-   Fetching ERC20 decimals

**Deliverables:**

-   Detail page shows all real data
-   Contribution calculator shows correct token reward
-   Question: If tokensPerEth is 100, and I contribute 0.5 ETH, how many tokens do I get?

* * * * *

#### Step 4.6: My Campaigns Page

**Tasks:**

1.  Call `getCompaignsOf(userAddress)` from factory
2.  Display campaigns created by connected user
3.  If no campaigns, show "You haven't created any campaigns yet"
4.  Add "Create Your First Campaign" link

**Deliverables:**

-   Page shows campaigns you created
-   Different user sees different campaigns
-   Empty state looks good

* * * * *

#### Step 4.7: Display Token Info

**Tasks:**

1.  For a campaign, read the token address
2.  Create `useTokenInfo(tokenAddress)` hook:
    -   Reads `name()`, `symbol()`, `decimals()` from ERC20
    -   Use standard ERC20 ABI
3.  Display: "Rewards: 100 TOKEN per ETH"
4.  Handle token decimal properly in reward calculations

**Research Topics:**

-   ERC20 standard interface
-   Token decimals (why they exist)

**Deliverables:**

-   Campaign shows token symbol (e.g., "TEST")
-   Reward calculations respect decimals
-   Explain: If a token has 6 decimals instead of 18, how does that change the display?

**Phase 4 Complete! 🎉**\
*You can now READ the entire blockchain state. Next: WRITE to it.*

* * * * *

✍️ Phase 5: Writing Transactions
--------------------------------

**Duration:** 2-3 weeks (this is the CORE phase)\
**Goal:** Execute all contract interactions: create, approve, contribute, finalize, withdraw, refund

### What You'll Learn

-   Transaction lifecycle
-   Gas estimation
-   Error handling (revert reasons)
-   User confirmation flows
-   State management during async operations
-   **The token approval UX challenge!**

* * * * *

### Step 5.1: Transaction UI Pattern

**Before writing specific transactions, create a reusable pattern.**

**Tasks:**

1.  Create `TransactionButton` component that handles:
    -   Click → "Waiting for wallet confirmation" state
    -   After confirmation → "Transaction pending..." (show tx hash)
    -   After 1 confirmation → "Success!" (show checkmark)
    -   Error → Show error message
2.  Install `react-hot-toast` for notifications
3.  Test with a mock async function

**Research Topics:**

-   Transaction states: idle → preparing → wallet confirmation → pending → confirmed → error
-   wagmi `useContractWrite` and `useWaitForTransaction`
-   UX patterns for blockchain transactions

**Deliverables:**

-   Reusable transaction button component
-   Toast notifications on success/error
-   Demo video showing all states

* * * * *

### Step 5.2: Create Campaign Transaction

**Tasks:**

1.  On `CreateCampaignPage`, use `useContractWrite`:
2.  On form submit:
    -   Convert ETH to wei (`parseEther`)
    -   Convert days to seconds
    -   Validate token address format
    -   Call `createClone(goal, duration, tokensPerEth, tokenAddress)`
3.  Wait for transaction confirmation using `useWaitForTransaction`
4.  Parse `CompaignCreated` event from receipt to get new campaign address:
    -   Use `receipt.logs` and `decodeEventLog` from viem
5.  Redirect to `/campaign/{newAddress}`
6.  Show success message

**Research Topics:**

-   Parsing event logs from transaction receipts
-   wagmi transaction hooks
-   Form submission handling

**Deliverables:**

-   Working campaign creation flow
-   New campaign appears in list immediately after creation
-   Video: Create campaign → Wait → Redirect → See it live
-   Question: Why do we need to parse the event instead of just knowing the address?

**Common Errors to Debug:**

-   "Gas estimation failed" → What does this mean?
-   Transaction reverts → Check constructor requirements

* * * * *

### Step 5.3: Token Approval - THE CRITICAL FLOW

**This is the most important UX challenge in your app!**

**Background:**\
Contributors can't receive rewards unless the creator approves the campaign contract to spend reward tokens. This is confusing for users.

**Tasks:**

1.  On campaign detail page (creator view), add:

    -   Read current allowance: `token.allowance(creator, campaignAddress)`
    -   Display: "Current allowance: 50,000 TOKENS"
    -   Calculate recommended allowance:
        -   If goal is 10 ETH and rate is 100 tokens/ETH → Need 1,000 tokens
        -   Show: "Recommended: {amount} tokens (enough for goal)"
    -   Input for custom allowance amount
    -   "Approve" button
2.  Implement ERC20 approval:

    -   Call `approveTokens(campaignAddress, amount)`
    -   Show transaction states
    -   After success, refetch allowance
3.  Add visual indicators:

    -   ✅ Green badge if allowance >= recommended
    -   ⚠️ Yellow warning if allowance < recommended
    -   ❌ Red error if allowance = 0
4.  **Most Important:** Add a setup wizard for new campaigns:

    -   Step 1: Campaign created ✓
    -   Step 2: Approve rewards ← YOU ARE HERE
    -   Step 3: Share campaign
    -   This guides creators through the flow!

**Research Topics:**

-   ERC20 approve/allowance pattern
-   Why this two-step pattern exists (security)
-   Infinite approvals (pros/cons)

**Deliverables:**

-   Working approval flow
-   Visual allowance status
-   Setup wizard UI
-   Test scenario: Create campaign → Try to contribute WITHOUT approving → See it fail → Approve → Contribute succeeds
-   Written explanation: "Why can't the contract just take the tokens automatically?"

**This is where many beginners struggle. We'll spend extra time here if needed!**

* * * * *

### Step 5.4: Contribute Transaction

**Tasks:**

1.  On campaign detail page, contribute section:

    -   Input for amount (in ETH)
    -   Live calculation of token reward
    -   Check if allowance sufficient (if not, show warning)
    -   "Contribute" button
2.  Implement contribution:

    -   This is a PAYABLE function - send ETH with it:
    -   After success:
        -   Show success message with token reward
        -   Refetch campaign data (totalRaised updated)
        -   Refetch user contribution
3.  Add validations:

    -   Amount > 0
    -   Amount <= user's balance
    -   Deadline not passed
    -   Campaign state = Funding
4.  Handle errors gracefully:

    -   "Insufficient allowance" → Explain and link to approval
    -   "Deadline passed" → Show message
    -   Generic errors → Show revert reason

**Research Topics:**

-   Payable functions
-   Sending value with transactions
-   Transaction error handling

**Deliverables:**

-   Working contribution flow
-   User balance updates in real-time
-   Error handling for all cases
-   Test: Contribute to your own campaign, receive tokens
-   Question: What happens to your ETH after you contribute?

* * * * *

### Step 5.5: Finalize Transaction

**Tasks:**

1.  Add "Finalize" button on campaign detail (visible to everyone if deadline passed)
2.  Check if deadline has passed (client-side and contract-side)
3.  Call `finalize()`
4.  After success, refetch campaign state (should change to Successful or Failed)
5.  Update UI to reflect new state

**Research Topics:**

-   Why finalize is needed (state transitions)
-   Who can call finalize? (anyone!)
-   What determines success vs failure?

**Deliverables:**

-   Finalize button appears after deadline
-   State changes correctly
-   Different UI for successful vs failed campaigns

* * * * *

### Step 5.6: Withdraw Transaction (Creator)

**Tasks:**

1.  Add "Withdraw" button (creator only, successful campaigns only)
2.  Check conditions:
    -   Connected wallet === creator
    -   State === Successful
    -   Not already withdrawn
3.  Call `withdraw()`
4.  After success, show withdrawn badge
5.  Creator's ETH balance should increase

**Research Topics:**

-   Access control in UI vs contract
-   Why check conditions in UI if contract checks too? (UX!)

**Deliverables:**

-   Working withdraw flow
-   Video: Full successful campaign flow (create → contribute → finalize → withdraw)

* * * * *

### Step 5.7: Refund Transaction (Contributors)

**Tasks:**

1.  Add "Refund" button (contributors only, failed campaigns only)
2.  Check conditions:
    -   User has contributions > 0
    -   State === Failed
    -   Deadline passed
3.  Call `refund()`
4.  After success, user's contribution should be 0
5.  User's ETH balance should increase by their contribution

**Deliverables:**

-   Working refund flow
-   Test scenario: Create campaign with high goal → contribute small amount → wait for deadline → finalize → refund

* * * * *

### Step 5.8: Transaction History & Notifications

**Tasks:**

1.  Store recent transactions in local state or localStorage:
    -   "Created campaign X"
    -   "Contributed 0.5 ETH to campaign Y"
    -   etc.
2.  Show notification bell in header with count
3.  Click to see recent activity
4.  Link to Etherscan for each transaction

**Research Topics:**

-   localStorage for persistence
-   Notification UX patterns

**Deliverables:**

-   Activity log component
-   Persists across page refreshes

**Phase 5 Complete! 🎉**\
*Your DApp is now FULLY FUNCTIONAL! Everything works!*

* * * * *

💎 Phase 6: Polish & Edge Cases
-------------------------------

**Duration:** 1 week\
**Goal:** Handle edge cases and create production-quality UX

### Steps to Complete

#### Step 6.1: Proper Token Decimal Handling

**The Problem:**\
Not all tokens have 18 decimals. Your reward calculations might be wrong!

**Tasks:**

1.  Fetch `decimals()` from reward token
2.  Update reward calculation to respect decimals:
3.  Test with a 6-decimal token and an 18-decimal token
4.  Create `formatTokenAmount(amount, decimals)` utility

**Deliverables:**

-   Correct display for any token decimal
-   Explain: Why do different tokens have different decimals?

* * * * *

#### Step 6.2: Real-time Countdown & Auto-refresh

**Tasks:**

1.  Create countdown component:
    -   Shows: "3 days, 5 hours, 12 minutes" until deadline
    -   Updates every second
    -   After deadline, shows "Ended"
2.  Auto-refresh campaign data when deadline passes:
    -   Use `setInterval` to check
    -   When countdown hits 0, refetch campaign state
    -   Show "Finalize now" button

**Research Topics:**

-   React `useEffect` cleanup (prevent memory leaks)
-   Interval-based updates

**Deliverables:**

-   Live countdown on detail page
-   Auto-updates when deadline passes

* * * * *

#### Step 6.3: Campaign Status Logic

**Tasks:**

1.  Create `getCampaignStatus(summary)` utility that returns:
    -   "Funding" - before deadline, goal not met
    -   "Successful" - goal met (regardless of deadline)
    -   "Failed" - deadline passed, goal not met, finalized
    -   "Withdrawn" - successful and withdrawn
    -   "Funding Ended" - deadline passed but not finalized yet
2.  Use consistent status across all pages
3.  Color-code badges (green = successful, red = failed, yellow = funding, gray = withdrawn)

**Deliverables:**

-   Consistent status display
-   Clear visual distinction

* * * * *

#### Step 6.4: Error Message Improvements

**Tasks:**

1.  Create error message mapper:
2.  Handle common errors:
    -   Insufficient allowance
    -   Deadline passed
    -   Already withdrawn
    -   User rejected transaction
    -   Insufficient funds
    -   Wrong network
3.  Show actionable messages ("Click here to approve tokens")

**Deliverables:**

-   User-friendly error messages
-   No raw revert strings shown to users

* * * * *

#### Step 6.5: Loading States & Skeletons

**Tasks:**

1.  Add skeleton loaders for:
    -   Campaign cards while loading
    -   Campaign detail page while loading
2.  Add spinners during transactions
3.  Disable buttons during loading
4.  Show "Refreshing..." indicator when refetching data

**Research Topics:**

-   Skeleton UI patterns
-   Optimistic UI updates

**Deliverables:**

-   Professional loading experience
-   No sudden content shifts

* * * * *

#### Step 6.6: Mobile Responsiveness

**Tasks:**

1.  Test on mobile (use Chrome DevTools device emulation)
2.  Fix layout issues:
    -   Stack cards vertically on mobile
    -   Make forms full-width
    -   Adjust header for mobile
3.  Test wallet connection on mobile (use WalletConnect)

**Deliverables:**

-   Works perfectly on phone
-   Screenshots on mobile

* * * * *

#### Step 6.7: Accessibility

**Tasks:**

1.  Add proper HTML semantics (`<main>`, `<nav>`, `<article>`)
2.  Add `aria-label` to buttons
3.  Test keyboard navigation (Tab through all interactive elements)
4.  Add focus indicators
5.  Test with screen reader (optional but valuable)

**Research Topics:**

-   WCAG basics
-   Accessible forms

**Deliverables:**

-   Can navigate entire app with keyboard
-   Proper focus indicators

**Phase 6 Complete! 🎉**\
*Your DApp is now polished and production-ready!*

* * * * *

🚀 Phase 7: Testing & Deployment
--------------------------------

**Duration:** 1 week\
**Goal:** Test thoroughly and deploy to production

### Step 7.1: Manual Testing Checklist

**Create a spreadsheet and test each scenario:**

**Campaign Creation:**

-   [ ]  Create campaign with valid data
-   [ ]  Try invalid goal (should fail)
-   [ ]  Try invalid duration (should fail)
-   [ ]  Try invalid token address (should fail)
-   [ ]  Create from different wallet addresses

**Token Approval:**

-   [ ]  Approve exact amount
-   [ ]  Approve more than needed
-   [ ]  Try contributing before approval (should fail)
-   [ ]  Approve after contribution fails (then succeed)

**Contribution:**

-   [ ]  Contribute small amount
-   [ ]  Contribute exact goal amount
-   [ ]  Try contributing after deadline (should fail)
-   [ ]  Multiple users contribute to same campaign
-   [ ]  Check token rewards received

**Finalization:**

-   [ ]  Finalize successful campaign
-   [ ]  Finalize failed campaign
-   [ ]  Try finalize before deadline (should fail)

**Withdrawal:**

-   [ ]  Withdraw from successful campaign (creator)
-   [ ]  Try withdraw from failed campaign (should fail)
-   [ ]  Try withdraw as non-creator (should fail)
-   [ ]  Try withdraw twice (should fail)

**Refund:**

-   [ ]  Refund from failed campaign
-   [ ]  Try refund from successful campaign (should fail)
-   [ ]  Try refund with no contribution (should fail)

**Edge Cases:**

-   [ ]  Wrong network connected
-   [ ]  Wallet disconnected mid-flow
-   [ ]  Multiple tabs open
-   [ ]  Page refresh during transaction

**Deliverables:**

-   Completed checklist
-   List of any bugs found and fixed

* * * * *

### Step 7.2: Deploy to Production Hosting

**Tasks:**

1.  Build production React app: `npm run build`
2.  Deploy to hosting:
    -   **Vercel** (recommended - free, automatic deployments)
    -   Or Netlify, GitHub Pages
3.  Update contract addresses if needed (ensure using correct Sepolia addresses)
4.  Test live site
5.  Get a custom domain (optional)

**Research Topics:**

-   Vercel deployment
-   Environment variables in production

**Deliverables:**

-   Live URL
-   Share with friends for testing!

* * * * *

### Step 7.3: Documentation

**Tasks:**

1.  Write [README.md](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) for your project:
    -   What it does
    -   Tech stack
    -   How to run locally
    -   Deployed contract addresses
    -   Link to live app
2.  Add screenshots
3.  Explain the token approval flow (this is unique to your app)
4.  Write a "Lessons Learned" section

**Deliverables:**

-   Professional README
-   Can share this in job applications!

**Phase 7 Complete! 🎉**\
*Your DApp is LIVE and ready for the world!*

* * * * *

🎓 Phase 8 (Optional): Advanced Features
----------------------------------------

**Duration:** 2-4 weeks\
**Goal:** Add advanced features if you want to continue learning

### Possible Extensions:

#### 8.1: Real-time Event Listening

-   Use `wagmi` to listen for `Contributed` events live
-   Update UI without refresh when someone contributes
-   Show toast: "Someone just contributed 0.5 ETH!"

#### 8.2: Event Indexing with The Graph

-   Learn The Graph protocol
-   Create subgraph for your contracts
-   Query historical data efficiently
-   Build "Campaign Analytics" page

#### 8.3: IPFS Integration

-   Add campaign images/descriptions
-   Store metadata on IPFS
-   Reference IPFS hash in contract

#### 8.4: Testing

-   Write unit tests for utility functions
-   Write integration tests for hooks
-   E2E tests with Playwright
-   Smart contract tests with Hardhat

#### 8.5: Advanced UX

-   Pagination for campaign list
-   Sorting/filtering
-   Search functionality
-   User contribution history page

* * * * *

📚 Research Resources by Phase
------------------------------

### Phase 1 (Smart Contracts)

-   [Hardhat Documentation](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [OpenZeppelin Contracts](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [Sepolia Testnet Faucet](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [Etherscan Sepolia](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

### Phase 2 (React)

-   [Vite Guide](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [React Router Tutorial](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [Tailwind CSS Docs](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

### Phase 3 & 4 & 5 (Web3)

-   [wagmi Documentation](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [RainbowKit Docs](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [ethers.js v6 Docs](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [viem Documentation](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

### General Web3 Learning

-   [Ethereum.org Developer Docs](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [useDApp Examples](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
-   [Scaffold-ETH](vscode-file://vscode-app/c:/Users/harsh/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) (reference implementations)

* * * * *

🎯 How We'll Work Together
--------------------------

### Your Responsibilities:

1.  **Research** the topics I list for each step
2.  **Implement** the tasks
3.  **Test** your implementation
4.  **Ask questions** when stuck (don't struggle alone for hours!)
5.  **Document** what you learn (keep notes)

### My Responsibilities:

1.  **Review** your code and approach
2.  **Explain** concepts when you're confused
3.  **Suggest** improvements and best practices
4.  **Debug** with you when things break
5.  **Validate** that you understand before moving forward
6.  **Adjust** the roadmap based on your pace

### Communication Pattern:

**Before starting a step:**

-   You: "Starting Step 2.3 - Building Campaign Card"
-   Me: "Great! Remember to focus on the formatting utilities first."

**During a step:**

-   You: "I'm getting an error with shortenAddress - it's returning undefined"
-   Me: [Help you debug, ask clarifying questions]

**After completing a step:**

-   You: "Completed Step 2.3 - here's my code [paste or screenshot]"
-   Me: [Review, give feedback, approve to continue or suggest changes]

### When You Get Stuck:

1.  Try debugging for 15-20 minutes yourself
2.  Search documentation
3.  If still stuck, message me with:
    -   What you're trying to do
    -   What you've tried
    -   The error message or unexpected behavior
    -   Relevant code snippet

* * * * *

📝 Memory & Context Management
------------------------------

I'll create a `learning-journal/` folder to track:

-   ✅ Completed phases
-   📚 Key learnings
-   🐛 Bugs encountered and fixed
-   💡 "Aha!" moments
-   ❓ Questions asked and answered

This ensures continuity across sessions and helps both of us track progress.

* * * * *

🎯 Success Criteria - What "Done" Looks Like
--------------------------------------------

### Minimum Viable DApp (End of Phase 5):

-   ✅ All 4 pages working
-   ✅ Wallet connection
-   ✅ Can create campaigns
-   ✅ Can contribute and receive tokens
-   ✅ Can withdraw/refund
-   ✅ Deployed on testnet
-   ✅ You can explain every line of code

### Polished DApp (End of Phase 6):

-   ✅ Professional UI/UX
-   ✅ Handles all edge cases
-   ✅ Mobile responsive
-   ✅ Clear error messages
-   ✅ Loading states

### Production DApp (End of Phase 7):

-   ✅ Live URL
-   ✅ Tested thoroughly
-   ✅ Documentation complete
-   ✅ Portfolio-ready

* * * * *

🚦 Next Steps - Let's Begin!
----------------------------

### Immediate Action:

1.  **Confirm** you understand the roadmap structure
2.  **Ask** any clarifying questions about the overall plan
3.  **Set up** your development environment:
    -   Node.js installed
    -   VS Code (or your preferred editor)
    -   MetaMask extension
    -   Get Sepolia ETH from faucet
4.  **Start Phase 1, Step 1.1** - Set up Hardhat project

### First Checkpoint:

When you've completed Step 1.1 (Hardhat setup), come back and show me:

-   Your project structure
-   Screenshot of successful compilation
-   Any questions or issues you encountered

* * * * *

💪 Final Words of Encouragement
-------------------------------

**This roadmap is designed to be:**

-   ✅ Achievable for your current level
-   ✅ Comprehensive (real-world skills)
-   ✅ Flexible (we can adjust as needed)
-   ✅ Educational (understanding > speed)

**Remember:**

-   Getting stuck is part of learning
-   Every error message teaches you something
-   Your first DApp won't be perfect - that's okay!
-   The journey matters more than the destination
-   **Ask questions - there are no stupid questions!**

**You have:**

-   Smart contracts ready ✅
-   React fundamentals ✅
-   Testnet access ✅
-   A mentor (me!) ✅
-   Motivation ✅

**You're ready. Let's build something amazing! 🚀**

* * * * *
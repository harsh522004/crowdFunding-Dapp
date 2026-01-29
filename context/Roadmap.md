📖 Phase 4: Reading Contract Data
---------------------------------

**Duration:** 1-1.5 weeks\
**Goal:** Fetch and display real campaign data from your deployed contracts

### What You'll Learn

-   ABIs (the contract's API)
-   Contract read operations with wagmi v2
-   React hooks for async Web3 calls
-   Error handling and loading states

### Good News: View Functions Already Implemented! ✅

**Your current contracts already include comprehensive view functions:**

-   `getCompaignDetails()` - Returns all campaign data in one call (creator, goal, deadline, totalRaised, state, withdrawn, rewardPerEth)
-   `getContributionOf(address)` - Returns individual contribution amount
-   Status helpers: `isActive()`, `hasEnded()`, `isSuccessful()`, `isFailed()`
-   Individual getters: `getCreator()`, `getGoal()`, `getDeadline()`, `getTotalRaised()`, `getState()`
-   `getRecommendedAllowance()` - Calculates required token approval for factory admin

**This means we can skip straight to using them in the frontend!**

* * * * *

#### Step 4.1: Understand Your Contract's View Functions

**Tasks:**

1.  Read your deployed MasterContract on Etherscan
2.  Call each view function manually to understand the return values:
    -   `getCompaignDetails()` - Note the order of return values: (creator, goal, deadline, totalRaised, state, withdrawn, rewardPerEth)
    -   `getContributionOf(yourAddress)` - Check your contribution
    -   `isActive()`, `hasEnded()` - Test status helpers
    -   `getRecommendedAllowance()` - Understand the calculation
3.  Document the return types (especially the State enum: 0=Funding, 1=Successful, 2=Failed, 3=Withdrawn)

**Research Topics:**

-   Solidity multiple return values (tuples)
-   How enums serialize to integers in ABI calls
-   Why one function call is better than seven separate calls

**Deliverables:**

-   Etherscan screenshots showing view function outputs
-   Notes on return value structure for `getCompaignDetails()`
-   Answer: "Why is `getCompaignDetails()` better than calling 7 separate getter functions?"

* * * * *

#### Step 4.2: Export ABIs to Frontend

**Tasks:**

1.  After compilation, Hardhat creates ABIs in `artifacts/` folder:
    -   Navigate to `artifacts/contracts/`
    -   Find `CampaignProxyFactory.sol/CampaignProxyFactory.json`
    -   Find `CrowdFundingMaster.sol/CrowdFundingMaster.json`

2.  Copy ABIs to your React project:
    -   Create `src/contracts/` folder in your frontend
    -   Copy the two JSON files OR extract just the `abi` array
    -   Also get a standard ERC20 ABI (from OpenZeppelin or wagmi)

3.  Create `src/contracts/config.js` with your deployed addresses:
    ```javascript
    export const CONTRACTS = {
      factory: '0xC4C7fcd7128A15b5D78C0Cab51F123Bda9f1BD13', // Your factory address
      // Campaign addresses will be fetched dynamically
    };
    
    export const SEPOLIA_CHAIN_ID = 11155111;
    ```

**Research Topics:**

-   What is an ABI?
-   Why does the frontend need it?
-   How does the ABI encode function calls?
-   JSON structure of ABIs

**Deliverables:**

-   ABIs in frontend project (`src/contracts/` folder)
-   Config file with contract addresses
-   Question: What would happen if the ABI doesn't match the deployed contract?

* * * * *

#### Step 4.3: Read Campaign List from Factory

**Tasks:**

1.  On `HomePage`, use wagmi's `useReadContract` hook (v2 API):
    ```javascript
    import { useReadContract } from 'wagmi';
    import { CONTRACTS } from '../contracts/config';
    import FactoryABI from '../contracts/FactoryABI.json';
    
    function HomePage() {
      const { data: campaigns, isLoading, error } = useReadContract({
        address: CONTRACTS.factory,
        abi: FactoryABI,
        functionName: 'getAllCompaigns',
      });
      
      if (isLoading) return <div>Loading campaigns...</div>;
      if (error) return <div>Error: {error.message}</div>;
      if (!campaigns || campaigns.length === 0) {
        return <div>No campaigns yet. Be the first to create one!</div>;
      }
      
      return (
        <div>
          {campaigns.map((address) => (
            <CampaignCard key={address} address={address} />
          ))}
        </div>
      );
    }
    ```

2.  Display the array of campaign addresses
3.  Add comprehensive error handling
4.  Add loading state (spinner or skeleton)
5.  Handle empty state ("No campaigns yet")

**Research Topics:**

-   wagmi v2 `useReadContract` hook (replaces old `useContractRead`)
-   Why reads don't cost gas
-   RPC calls under the hood
-   React conditional rendering patterns

**Deliverables:**

-   Homepage displays real campaign addresses from your deployed factory
-   Loading spinner while fetching
-   Error message if RPC fails with clear explanation
-   Empty state shows "No campaigns created yet" with helpful message
-   Explain: "Where is this data coming from? Why is it free?"

* * * * *

#### Step 4.4: Read Campaign Details for Each Card

**Tasks:**

1.  Create a custom hook `useCampaignDetails(address)` in `src/hooks/useCampaignDetails.js`:
    ```javascript
    import { useReadContract } from 'wagmi';
    import { formatEther } from 'viem';
    import MasterABI from '../contracts/MasterABI.json';
    
    export function useCampaignDetails(campaignAddress) {
      const { data, isLoading, error } = useReadContract({
        address: campaignAddress,
        abi: MasterABI,
        functionName: 'getCompaignDetails', // Note: contract spells it "Compaign"
      });
      
      if (!data) return { isLoading, error };
      
      // Destructure the tuple
      const [creator, goal, deadline, totalRaised, state, withdrawn, rewardPerEth] = data;
      
      return {
        creator,
        goal: formatEther(goal), // Convert BigInt to ETH string
        deadline: Number(deadline), // Convert BigInt to number (timestamp)
        totalRaised: formatEther(totalRaised),
        state: Number(state), // 0=Funding, 1=Successful, 2=Failed, 3=Withdrawn
        withdrawn,
        rewardPerEth: formatEther(rewardPerEth),
        isLoading,
        error,
      };
    }
    ```

2.  Use this hook in `CampaignCard` component
3.  Replace all mock data with real data
4.  Handle the State enum with a helper function:
    ```javascript
    function getStateLabel(state) {
      const states = ['Funding', 'Successful', 'Failed', 'Withdrawn'];
      return states[state] || 'Unknown';
    }
    ```

5.  Calculate progress percentage: `(totalRaised / goal) * 100`
6.  Format deadline as readable date using `date-fns`

**Research Topics:**

-   Custom React hooks best practices
-   Solidity enums (how they serialize to integers)
-   BigInt handling in JavaScript (modern approach)
-   viem's `formatEther` utility

**Deliverables:**

-   Homepage shows REAL campaigns with REAL data
-   Status badges reflect actual contract state with colors
-   Progress bar shows actual totalRaised/goal percentage
-   Proper error handling for each card
-   Code review: Demonstrate how you handle BigInt conversion safely

* * * * *

#### Step 4.5: Campaign Detail Page Data

**Tasks:**

1.  Get `address` from URL using React Router's `useParams()`:
    ```javascript
    import { useParams } from 'react-router-dom';
    import { useAccount } from 'wagmi';
    
    function CampaignDetailPage() {
      const { address: campaignAddress } = useParams();
      const { address: userAddress, isConnected } = useAccount();
      
      const campaignDetails = useCampaignDetails(campaignAddress);
      
      // Only fetch user's contribution if wallet connected
      const { data: userContribution } = useReadContract({
        address: campaignAddress,
        abi: MasterABI,
        functionName: 'getContributionOf',
        args: [userAddress],
        enabled: !!userAddress, // Important: only run if address exists
      });
      
      // ... rest of component
    }
    ```

2.  Display all campaign data on detail page:
    -   Convert wei to ETH for display (use viem's `formatEther`)
    -   Show deadline as readable date
    -   Show countdown if still active
    -   Show user's contribution amount (if connected)
    -   Show whether user is the creator

3.  Create a live token reward calculator:
    ```javascript
    function calculateReward(ethAmount, rewardPerEth) {
      if (!ethAmount || !rewardPerEth) return '0';
      return (parseFloat(ethAmount) * parseFloat(rewardPerEth)).toFixed(2);
    }
    ```

4.  Add input field for contribution amount with live reward calculation
5.  Handle all edge cases (not connected, invalid address, loading, error)

**Research Topics:**

-   viem's `formatEther` and `parseEther` (modern replacement for ethers.js)
-   BigInt handling in JavaScript
-   Conditional queries with `enabled` option in wagmi
-   Timestamp to date conversion

**Deliverables:**

-   Detail page shows all real data from `getCompaignDetails()`
-   Contribution calculator shows correct token reward in real-time
-   Question: If rewardPerEth is 100, and I contribute 0.5 ETH, how many tokens do I get? (Answer: 50 tokens)
-   Explain: "Why does the contract use `(msg.value * 10^18 * rewardRate) / 1 ether`?"
-   Screenshot showing live calculation working

* * * * *

#### Step 4.6: My Campaigns Page

**Tasks:**

1.  Call `getCampaignsOf(userAddress)` from factory (note: correct spelling here, not "Compaigns"):
    ```javascript
    import { useAccount, useReadContract } from 'wagmi';
    import { CONTRACTS } from '../contracts/config';
    import FactoryABI from '../contracts/FactoryABI.json';
    
    function MyCampaignsPage() {
      const { address, isConnected } = useAccount();
      
      const { data: myCampaigns, isLoading } = useReadContract({
        address: CONTRACTS.factory,
        abi: FactoryABI,
        functionName: 'getCampaignsOf',
        args: [address],
        enabled: !!address, // Only run if wallet connected
      });
      
      if (!isConnected) {
        return (
          <div>
            <p>Connect your wallet to see your campaigns</p>
            {/* ConnectButton will be in header */}
          </div>
        );
      }
      
      if (isLoading) return <div>Loading your campaigns...</div>;
      
      if (!myCampaigns || myCampaigns.length === 0) {
        return (
          <div>
            <p>You haven't created any campaigns yet</p>
            <Link to="/create">Create Your First Campaign</Link>
          </div>
        );
      }
      
      return (
        <div>
          {myCampaigns.map((address) => (
            <CampaignCard key={address} address={address} isOwner={true} />
          ))}
        </div>
      );
    }
    ```

2.  For each campaign address, use your `useCampaignDetails` hook to get full data
3.  Display campaigns with special "Creator" badge
4.  Show empty state with clear call-to-action
5.  Show "Connect wallet" message if not connected

**Research Topics:**

-   Conditional hook execution with `enabled`
-   React Router `Link` component
-   Empty states and loading states

**Deliverables:**

-   Page shows campaigns you created (and ONLY yours)
-   Different user sees different campaigns (test with 2 wallets)
-   Empty state looks good with helpful message
-   Works correctly when wallet disconnects mid-session

* * * * *

#### Step 4.7: Display Token Info

**Tasks:**

1.  First, read the token address from campaign:
    ```javascript
    const { data: tokenAddress } = useReadContract({
      address: campaignAddress,
      abi: MasterABI,
      functionName: 'token',
    });
    ```

2.  Create `useTokenInfo(tokenAddress)` custom hook in `src/hooks/useTokenInfo.js`:
    ```javascript
    import { useReadContracts } from 'wagmi';
    import ERC20_ABI from '../contracts/ERC20_ABI.json';
    
    export function useTokenInfo(tokenAddress) {
      const { data, isLoading } = useReadContracts({
        contracts: [
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'name',
          },
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'symbol',
          },
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'decimals',
          },
        ],
        enabled: !!tokenAddress,
      });
      
      if (!data) return { isLoading };
      
      return {
        name: data[0]?.result,
        symbol: data[1]?.result,
        decimals: data[2]?.result,
        isLoading,
      };
    }
    ```

3.  Display token info in campaign card and detail page:
    ```javascript
    const tokenInfo = useTokenInfo(tokenAddress);
    
    // Display: "Rewards: 100 KARMA per ETH"
    <p>Rewards: {rewardPerEth} {tokenInfo.symbol} per ETH</p>
    ```

4.  Handle token decimals properly in reward calculations
5.  Note: Most tokens use 18 decimals, but some (like USDC) use 6!

**Research Topics:**

-   ERC20 standard interface
-   Token decimals (why they exist)
-   wagmi's `useReadContracts` for batch reads
-   Decimal normalization

**Deliverables:**

-   Campaign shows token symbol (e.g., "KARMA", "TEST")
-   Reward calculations respect decimals
-   Explain: "If a token has 6 decimals instead of 18, how does that change the display?"
-   Test with your deployed token

**Phase 4 Complete! 🎉**\
*You can now READ the entire blockchain state. Next: WRITE to it.*

**Before Phase 5:**
-   Verify all data displays correctly
-   Test with different wallets
-   Ensure error states work properly
-   Your app should be fully functional for READING (no writing yet)


* * * * *


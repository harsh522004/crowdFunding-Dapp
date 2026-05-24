# Portfolio Polish: CrowdFunding DApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix known bugs, add polish features, and add two new features (Admin Panel, Share button, Confetti) to make the DApp portfolio-ready and deploy-ready on Vercel.

**Architecture:** All changes are purely frontend — no smart contract redeployment needed. Changes follow the established pattern: hooks in `src/features/campaigns/hooks/`, reusable components in `src/components/`, pages in `src/Pages/`, utilities in `src/utils/`. The existing Karma.json ABI file covers all ERC20 calls needed. `CONTRACTS.token` is the single reward token address shared across all campaigns (factory-level architecture).

**Tech Stack:** React 19, TypeScript, Vite, wagmi v2, viem v2, RainbowKit, Tailwind CSS v4, react-router-dom v7, Karma.json ABI (already in repo)

---

## File Map: What Gets Created vs Modified

### New Files
| File | Purpose |
|------|---------|
| `crowFunding-Frontend/src/utils/etherscan.ts` | Helper functions to build Etherscan URLs |
| `crowFunding-Frontend/src/components/CopyButton.tsx` | Reusable clipboard copy button |
| `crowFunding-Frontend/src/components/Footer.tsx` | Site footer with links |
| `crowFunding-Frontend/src/components/HeroSection.tsx` | Homepage hero with campaign count stat |
| `crowFunding-Frontend/src/components/HowItWorks.tsx` | 3-step explainer section |
| `crowFunding-Frontend/src/features/campaigns/hooks/useTokenInfo.ts` | Fetch ERC20 symbol/name/decimals |
| `crowFunding-Frontend/src/Pages/AdminPage.tsx` | Admin panel for factory owner |
| `crowFunding-Frontend/src/hooks/useAdminPanel.ts` | Hook for admin allowance + approve logic |
| `crowFunding-Frontend/.env` | Local env vars (gitignored) |
| `crowFunding-Frontend/.env.example` | Committed env var template |

### Modified Files
| File | What Changes |
|------|-------------|
| `crowFunding-Frontend/src/features/campaigns/hooks/useCampaignContribution.ts` | Remove console.log |
| `crowFunding-Frontend/src/features/campaigns/hooks/useCampaignActions.ts` | Remove console.logs (3 of them) |
| `crowFunding-Frontend/src/features/campaigns/hooks/index.ts` | Export useTokenInfo |
| `crowFunding-Frontend/src/wagmiConfig.ts` | Read projectId from env var |
| `crowFunding-Frontend/src/main.tsx` | Remove unused import; add Admin route |
| `crowFunding-Frontend/src/components/TransactionButton.tsx` | Add Etherscan tx link below button |
| `crowFunding-Frontend/src/components/CampaignCard.tsx` | Add copy button + Etherscan address link |
| `crowFunding-Frontend/src/components/Layout.tsx` | Add Footer |
| `crowFunding-Frontend/src/components/Header.tsx` | Add Admin nav link (visible to factory owner only) |
| `crowFunding-Frontend/src/Pages/HomePage.tsx` | Add Hero, HowItWorks, status filter tabs |
| `crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx` | Fix canFinalize, real token symbol, copy buttons, Etherscan links, confetti, share button |
| `README.md` | Fix `yourusername` placeholder |

---

## Task 1: Code Quality Cleanup

**Items covered:** 16 (remove console.logs), 17 (projectId to env), 18 (unused import), 19 (App.tsx), 20 (README fix)

**Files:**
- Modify: `crowFunding-Frontend/src/features/campaigns/hooks/useCampaignContribution.ts:21`
- Modify: `crowFunding-Frontend/src/features/campaigns/hooks/useCampaignActions.ts:13,49,83`
- Modify: `crowFunding-Frontend/src/wagmiConfig.ts`
- Modify: `crowFunding-Frontend/src/main.tsx:4`
- Delete: `crowFunding-Frontend/src/App.tsx` (never used — RouterProvider in main.tsx bypasses it)
- Create: `crowFunding-Frontend/.env`
- Create: `crowFunding-Frontend/.env.example`
- Modify: `README.md:69`

- [x] **Step 1.1: Remove console.logs from useCampaignContribution.ts**

In `useCampaignContribution.ts`, remove line 21:
```typescript
// DELETE this line:
console.log("Contributing to campaign:", { campaignAddress, amountInEth, amountInWei });
```

- [x] **Step 1.2: Remove console.logs from useCampaignActions.ts**

In `useCampaignActions.ts`, remove these three lines:
```typescript
// In useFinalizeCampaign → finalizeCampaign function, DELETE:
console.log("Finalizing campaign:", campaignAddress);

// In useWithdrawCampaign → withdrawFunds function, DELETE:
console.log("Withdrawing funds from campaign:", campaignAddress);

// In useRefundCampaign → claimRefund function, DELETE:
console.log("Claiming refund from campaign:", campaignAddress);
```

- [x] **Step 1.3: Create .env and .env.example files**

Create `crowFunding-Frontend/.env`:
```
VITE_WALLETCONNECT_PROJECT_ID=5a80fd14b88c85602c947763720f985e
```

Create `crowFunding-Frontend/.env.example`:
```
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

Verify `.env` is already in `.gitignore` (it should be — Vite adds it by default). If not, add it.

- [x] **Step 1.4: Update wagmiConfig.ts to read from env**

Replace the hardcoded projectId in `crowFunding-Frontend/src/wagmiConfig.ts`:
```typescript
// src/wagmiConfig.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'CrowdFund DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string,
  chains: [sepolia],
  ssr: false,
  transports: {
    [sepolia.id]: http(),
  },
});
```

Note: `mainnet` import was also removed since only Sepolia is in `chains`.

- [x] **Step 1.5: Remove unused import in main.tsx**

In `crowFunding-Frontend/src/main.tsx`, delete line 4:
```typescript
// DELETE this line:
import "./Pages/HomePage.tsx";
```

- [x] **Step 1.6: Delete App.tsx**

Delete `crowFunding-Frontend/src/App.tsx`. It is never rendered — `main.tsx` renders `RouterProvider` directly, which mounts `Layout` and the page components. `App.tsx` was the default Vite scaffold file and is unused.

- [x] **Step 1.7: Fix README placeholder**

In `README.md` at line 69, replace:
```
git clone https://github.com/yourusername/crowdFunding-Dapp.git
```
With your actual GitHub username (e.g., `harsh522004`):
```
git clone https://github.com/harsh522004/crowdFunding-Dapp.git
```

- [x] **Step 1.8: Verify the build still passes**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Build completes with no TypeScript errors.

- [x] **Step 1.9: Commit**

```bash
git add crowFunding-Frontend/src/features/campaigns/hooks/useCampaignContribution.ts
git add crowFunding-Frontend/src/features/campaigns/hooks/useCampaignActions.ts
git add crowFunding-Frontend/src/wagmiConfig.ts
git add crowFunding-Frontend/src/main.tsx
git add crowFunding-Frontend/.env.example
git add README.md
git commit -m "chore: clean up console.logs, env vars, and unused files"
```

---

## Task 2: Etherscan Utilities + CopyButton Component

**Items covered:** Part of 4 (tx Etherscan links), 6 (copy-to-clipboard), 9 (address Etherscan links)

**Files:**
- Create: `crowFunding-Frontend/src/utils/etherscan.ts`
- Create: `crowFunding-Frontend/src/components/CopyButton.tsx`

- [x] **Step 2.1: Create etherscan.ts utility**

Create `crowFunding-Frontend/src/utils/etherscan.ts`:
```typescript
const ETHERSCAN_BASE = "https://sepolia.etherscan.io";

export const getAddressUrl = (address: string): string =>
  `${ETHERSCAN_BASE}/address/${address}`;

export const getTxUrl = (txHash: string): string =>
  `${ETHERSCAN_BASE}/tx/${txHash}`;
```

- [x] **Step 2.2: Create CopyButton component**

Create `crowFunding-Frontend/src/components/CopyButton.tsx`:
```tsx
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click-through
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-all
        ${copied
          ? "text-green-400 bg-green-500/10"
          : "text-slate-400 hover:text-white hover:bg-slate-700"
        } ${className}`}
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}
```

- [x] **Step 2.3: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Passes with no errors.

- [x] **Step 2.4: Commit**

```bash
git add crowFunding-Frontend/src/utils/etherscan.ts
git add crowFunding-Frontend/src/components/CopyButton.tsx
git commit -m "feat: add Etherscan URL helpers and CopyButton component"
```

---

## Task 3: useTokenInfo Hook — Fetch Real ERC20 Symbol

**Items covered:** 1 (token symbol hardcoded), 2 (token address per campaign)

**Context:** All campaigns in this factory use the same reward token (`CONTRACTS.token` — the KarmaToken). The `Karma.json` ABI is already in the repo and contains `symbol()`, `name()`, `decimals()`. No changes needed to `CampaignDetailsUI` type or mapper — the token address is factory-wide, not per-campaign.

**Files:**
- Create: `crowFunding-Frontend/src/features/campaigns/hooks/useTokenInfo.ts`
- Modify: `crowFunding-Frontend/src/features/campaigns/hooks/index.ts`

- [x] **Step 3.1: Create useTokenInfo hook**

Create `crowFunding-Frontend/src/features/campaigns/hooks/useTokenInfo.ts`:
```typescript
import { useReadContracts } from "wagmi";
import type { Address } from "viem";
import { SEPOLIA_CHAIN_ID } from "../../../contracts/config";
import karmaABI from "../../../contracts/Karma.json";

export type UseTokenInfoReturn = {
  symbol: string;
  name: string;
  decimals: number;
  isLoading: boolean;
};

const erc20Abi = karmaABI.abi as readonly object[];

export function useTokenInfo(tokenAddress: Address | undefined): UseTokenInfoReturn {
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "name",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: !!tokenAddress,
    },
  });

  const symbol = (data?.[0]?.result as string) ?? "TOKEN";
  const name = (data?.[1]?.result as string) ?? "Reward Token";
  const decimals = (data?.[2]?.result as number) ?? 18;

  return { symbol, name, decimals, isLoading };
}
```

- [x] **Step 3.2: Export from hooks index**

In `crowFunding-Frontend/src/features/campaigns/hooks/index.ts`, add at the end:
```typescript
export { useTokenInfo, type UseTokenInfoReturn } from "./useTokenInfo";
```

- [x] **Step 3.3: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Passes. If TypeScript complains about `karmaABI.abi`, assert it with `as readonly object[]` (already in the hook above).

- [x] **Step 3.4: Commit**

```bash
git add crowFunding-Frontend/src/features/campaigns/hooks/useTokenInfo.ts
git add crowFunding-Frontend/src/features/campaigns/hooks/index.ts
git commit -m "feat: add useTokenInfo hook to fetch live ERC20 symbol/name/decimals"
```

---

## Task 4: Fix canFinalize + Apply Real Token Symbol

**Items covered:** 3 (canFinalize locked to creator), 1 (replace "REWARD" with real symbol)

**Files:**
- Modify: `crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx`
- Modify: `crowFunding-Frontend/src/components/CampaignCard.tsx`

- [x] **Step 4.1: Import useTokenInfo in CampaignDetailPage**

At the top of `CampaignDetailPage.tsx`, add to the existing campaign hooks import:
```typescript
import {
  // ... existing imports ...
  useTokenInfo,
} from "../features/campaigns/hooks";
import { CONTRACTS } from "../contracts/config";
```

`CONTRACTS` is already imported — just ensure `useTokenInfo` is added to the import.

- [x] **Step 4.2: Call useTokenInfo in CampaignDetailPage**

After the existing hook calls (before any early returns), add:
```typescript
const { symbol: tokenSymbol, isLoading: isTokenLoading } = useTokenInfo(
  CONTRACTS.token as `0x${string}`
);
```

- [x] **Step 4.3: Fix canFinalize logic**

Find this line in `CampaignDetailPage.tsx` (around line 207):
```typescript
const canFinalize = campaign.status === "Funding" && hasEnded && isCreator;
```
Change it to:
```typescript
const canFinalize = campaign.status === "Funding" && hasEnded && isConnected;
```

This allows any connected wallet to trigger finalization after deadline — which matches what the contract allows (`finalize()` has no `onlyOwner` modifier).

- [x] **Step 4.4: Replace "REWARD" with tokenSymbol throughout CampaignDetailPage**

In `CampaignDetailPage.tsx`, replace every occurrence of the string `"REWARD"` with `{tokenSymbol}`. There are 6 occurrences, found in:
- Line 334: `+{...} {"REWARD"}` → `+{...} {tokenSymbol}`
- Line 392: `{estimatedReward} {"REWARD"}` → `{estimatedReward} {tokenSymbol}`
- Line 399: `{"REWARD"}/ETH` → `{tokenSymbol}/ETH`
- Line 541: `{"REWARD"}` (Token Symbol row) → `{isTokenLoading ? "..." : tokenSymbol}`
- Line 558: `{campaign.rewardRate} {"REWARD"}` → `{campaign.rewardRate} {tokenSymbol}`

- [x] **Step 4.5: Replace "REWARD" in CampaignCard**

`CampaignCard.tsx` shows `{props.campaign.rewardRate} tokens/ETH` at line 109 — this is generic text already ("tokens/ETH") so it's acceptable. No change needed here unless you want to pass tokenSymbol as a prop. Skip this for now to avoid prop drilling complexity.

- [x] **Step 4.6: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Passes.

- [x] **Step 4.7: Commit**

```bash
git add crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx
git commit -m "fix: fetch live token symbol and allow any user to finalize campaigns"
```

---

## Task 5: Add Etherscan Links to TransactionButton + CampaignCard + CampaignDetailPage

**Items covered:** 4 (tx Etherscan link), 9 (campaign address Etherscan links)

**Files:**
- Modify: `crowFunding-Frontend/src/components/TransactionButton.tsx`
- Modify: `crowFunding-Frontend/src/components/CampaignCard.tsx`
- Modify: `crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx`

- [x] **Step 5.1: Add Etherscan tx link to TransactionButton**

In `crowFunding-Frontend/src/components/TransactionButton.tsx`:

Add import at top:
```typescript
import { getTxUrl } from "../utils/etherscan";
```

The component already accepts a `txHash` prop but never uses it. In the JSX return, add this block below the `<button>` element (before the closing tag of the wrapper):
```tsx
return (
  <div className={`${fullWidth ? "w-full" : ""} flex flex-col items-center gap-2`}>
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full
        px-6 py-3 
        ${getVariantStyles()}
        text-white font-semibold rounded-lg 
        transition-all duration-200 
        border
        disabled:cursor-not-allowed 
        disabled:opacity-70
        hover:scale-[1.02] 
        active:scale-[0.98]
        disabled:scale-100
        shadow-lg 
        hover:shadow-xl
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {getIcon()}
      <span>{getCurrentText()}</span>
    </button>
    {txHash && (txState === "pending" || txState === "success") && (
      <a
        href={getTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300 underline"
      >
        View on Etherscan ↗
      </a>
    )}
  </div>
);
```

Note: The wrapping `<div>` replaces the `fullWidth` class that was on `<button>` — the button is now always `w-full` within the wrapper div, and the wrapper div controls full-width vs auto. Adjust the `fullWidth` className on the wrapper accordingly:
```tsx
<div className={`${fullWidth ? "w-full" : "inline-flex flex-col"} flex flex-col items-center gap-2`}>
```

- [x] **Step 5.2: Add Etherscan address link to CampaignCard**

In `crowFunding-Frontend/src/components/CampaignCard.tsx`:

Add imports at top:
```typescript
import { getAddressUrl } from "../utils/etherscan";
import { CopyButton } from "./CopyButton";
```

Replace the Campaign Address block (around line 63–69):
```tsx
{/* Address */}
<div className="mb-4">
  <p className="text-xs text-slate-500 mb-1">Campaign Address</p>
  <div className="flex items-center gap-2">
    <a
      href={getAddressUrl(props.campaign.address)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors"
    >
      {shortenAddress(props.campaign.address)}
    </a>
    <CopyButton text={props.campaign.address} />
  </div>
</div>
```

- [x] **Step 5.3: Add copy + Etherscan to CampaignDetailPage header**

In `CampaignDetailPage.tsx`, in the header section where the campaign address is shown (around line 235–237), replace:
```tsx
<p className="text-slate-400 font-mono text-xs sm:text-sm break-all">
  {address || campaign.address}
</p>
```
With:
```tsx
<div className="flex items-center gap-2 flex-wrap mt-1">
  <a
    href={getAddressUrl(address || campaign.address)}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 hover:text-blue-300 font-mono text-xs sm:text-sm break-all underline"
  >
    {address || campaign.address}
  </a>
  <CopyButton text={address || campaign.address} />
</div>
```

Also add import at the top of CampaignDetailPage.tsx:
```typescript
import { getAddressUrl, getTxUrl } from "../utils/etherscan";
import { CopyButton } from "../components/CopyButton";
```

Note: `getTxUrl` is imported here for use in Task 9 (Share button). If Task 9 is not implemented yet, import only `getAddressUrl`.

- [x] **Step 5.4: Add copy button to creator address in CampaignDetailPage stats**

In the Stats Grid (around line 295–303), the Creator card:
```tsx
<div className="bg-slate-900/50 rounded-lg p-4">
  <p className="text-xs text-slate-500 mb-1">Creator</p>
  <div className="flex items-center gap-2 flex-wrap">
    <a
      href={getAddressUrl(campaign.creator)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-mono text-blue-400 hover:text-blue-300 underline"
    >
      {shortenAddress(campaign.creator)}
    </a>
    <CopyButton text={campaign.creator} />
  </div>
  {isCreator && (
    <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
      You
    </span>
  )}
</div>
```

- [x] **Step 5.5: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Passes.

- [x] **Step 5.6: Commit**

```bash
git add crowFunding-Frontend/src/components/TransactionButton.tsx
git add crowFunding-Frontend/src/components/CampaignCard.tsx
git add crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx
git commit -m "feat: add Etherscan links and copy-to-clipboard for addresses and tx hashes"
```

---

## Task 6: Footer Component

**Item covered:** 10 (footer)

**Files:**
- Create: `crowFunding-Frontend/src/components/Footer.tsx`
- Modify: `crowFunding-Frontend/src/components/Layout.tsx`

- [x] **Step 6.1: Create Footer component**

Create `crowFunding-Frontend/src/components/Footer.tsx`:
```tsx
import { getAddressUrl } from "../utils/etherscan";
import { CONTRACTS } from "../contracts/config";

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900/95 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <span className="text-white font-bold">CrowdFund</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decentralized crowdfunding on Ethereum. Create campaigns, earn token rewards, secured by smart contracts.
            </p>
          </div>

          {/* Contracts */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Contracts (Sepolia)</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <a
                  href={getAddressUrl(CONTRACTS.factory)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-mono"
                >
                  Factory ↗
                </a>
              </li>
              <li>
                <a
                  href={getAddressUrl(CONTRACTS.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-mono"
                >
                  Karma Token ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Project</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <a
                  href="https://github.com/harsh522004/crowdFunding-Dapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Sepolia Etherscan ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-6 pt-4 text-center text-xs text-slate-600">
          Built on Ethereum · Sepolia Testnet · Open Source
        </div>
      </div>
    </footer>
  );
}
```

- [x] **Step 6.2: Add Footer to Layout**

In `crowFunding-Frontend/src/components/Layout.tsx`, replace the current content:
```tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { NetworkGuard } from "./NetworkGuard";
import { Footer } from "./Footer";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <NetworkGuard>
        <main className="flex-1">
          <Outlet />
        </main>
      </NetworkGuard>
      <Footer />
    </div>
  );
}

export default Layout;
```

Note: The `flex flex-col` + `flex-1` on `<main>` ensures the footer sticks to the bottom on short pages.

- [x] **Step 6.3: Remove duplicate background from page components**

With the background now in Layout, the `min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` on each page's root div is now redundant. However, removing it is optional and can be done incrementally — leaving it in place causes no visual issues (same color). Leave as-is for now to minimize diff.

- [x] **Step 6.4: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```

- [x] **Step 6.5: Commit**

```bash
git add crowFunding-Frontend/src/components/Footer.tsx
git add crowFunding-Frontend/src/components/Layout.tsx
git commit -m "feat: add footer with contract links and project info"
```

---

## Task 7: HomePage — Hero Section + How It Works

**Items covered:** 5 (hero section with stat), 7 (How It Works section)

**Files:**
- Create: `crowFunding-Frontend/src/components/HeroSection.tsx`
- Create: `crowFunding-Frontend/src/components/HowItWorks.tsx`
- Modify: `crowFunding-Frontend/src/Pages/HomePage.tsx`

- [x] **Step 7.1: Create HeroSection component**

Create `crowFunding-Frontend/src/components/HeroSection.tsx`:
```tsx
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  campaignCount: number;
  isLoading: boolean;
}

export function HeroSection({ campaignCount, isLoading }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 px-4 animate-fadeIn">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 mb-6">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
        Live on Sepolia Testnet
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
        Fund Ideas with{" "}
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Ethereum
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
        Create trustless crowdfunding campaigns. Contributors earn token rewards automatically, secured entirely by smart contracts.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <button
          onClick={() => navigate("/create")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
        >
          Create Campaign →
        </button>
        <a
          href="#campaigns"
          className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-600"
        >
          Browse Campaigns
        </a>
      </div>

      {/* Stat */}
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {isLoading ? (
              <span className="inline-block w-8 h-7 bg-slate-700 rounded animate-pulse" />
            ) : (
              campaignCount
            )}
          </p>
          <p className="text-xs text-slate-500">Campaigns Created</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">Karma</p>
          <p className="text-xs text-slate-500">Reward Token</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">Sepolia</p>
          <p className="text-xs text-slate-500">Network</p>
        </div>
      </div>
    </div>
  );
}
```

- [x] **Step 7.2: Create HowItWorks component**

Create `crowFunding-Frontend/src/components/HowItWorks.tsx`:
```tsx
const STEPS = [
  {
    number: "01",
    icon: "🚀",
    title: "Create a Campaign",
    description:
      "Set your funding goal, duration, and token reward rate. Your campaign deploys as a gas-efficient proxy clone on Ethereum.",
  },
  {
    number: "02",
    icon: "💰",
    title: "Contribute & Earn",
    description:
      "Anyone can send ETH to active campaigns. Karma token rewards are distributed instantly and automatically — no manual claims.",
  },
  {
    number: "03",
    icon: "✅",
    title: "Withdraw or Refund",
    description:
      "If the goal is reached, the creator withdraws the ETH. If it fails, contributors are fully refunded. All enforced by smart contracts.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 border-t border-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            How It Works
          </h2>
          <p className="text-slate-400">
            Three steps, fully on-chain, no middlemen.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Background number */}
              <span className="absolute top-4 right-4 text-5xl font-black text-slate-700/50 select-none group-hover:text-blue-500/10 transition-colors">
                {step.number}
              </span>

              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 7.3: Update HomePage to include HeroSection + HowItWorks**

Replace the full content of `crowFunding-Frontend/src/Pages/HomePage.tsx`:
```tsx
import CampaignCard from "../components/CampaignCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import { HeroSection } from "../components/HeroSection";
import { HowItWorks } from "../components/HowItWorks";
import { useNavigate } from "react-router-dom";
import {
  useCampaignsForHome,
  type UseCampaignsForHomeReturn,
} from "../features/campaigns/hooks";

function HomePage() {
  const navigate = useNavigate();
  const { campaigns, isLoading, error }: UseCampaignsForHomeReturn =
    useCampaignsForHome();

  const handleViewDetails = (campaignAddress: string) => {
    const campaign = campaigns.find((c) => c.address === campaignAddress);
    navigate(`/campaign/${campaignAddress}`, {
      state: { campaign },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">Failed to load campaigns</p>
          <p className="text-sm text-slate-400 mt-2">{error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <HeroSection campaignCount={campaigns.length} isLoading={isLoading} />

      {/* Campaign Grid */}
      <div id="campaigns" className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Active Campaigns
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Discover and support innovative projects
          </p>
        </div>

        {isLoading ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : campaigns.length > 0 ? (
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.address}
                campaign={campaign}
                onMoreDetails={() => handleViewDetails(campaign.address)}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="🚀"
            title="No Campaigns Yet"
            description="Be the first to create a crowdfunding campaign and start raising funds for your innovative project!"
            actionLabel="Create First Campaign"
            actionPath="/create"
          />
        )}
      </div>

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}

export default HomePage;
```

- [x] **Step 7.4: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```

- [x] **Step 7.5: Commit**

```bash
git add crowFunding-Frontend/src/components/HeroSection.tsx
git add crowFunding-Frontend/src/components/HowItWorks.tsx
git add crowFunding-Frontend/src/Pages/HomePage.tsx
git commit -m "feat: add hero section and How It Works to homepage"
```

---

## Task 8: Status Filter Tabs on HomePage

**Item covered:** 8 (filter by status)

**Files:**
- Modify: `crowFunding-Frontend/src/Pages/HomePage.tsx`

- [x] **Step 8.1: Add filter state and tabs to HomePage**

In `HomePage.tsx`, add the filter state and filtering logic. Replace the `function HomePage()` body (keep imports as-is from Task 7):

```tsx
function HomePage() {
  const navigate = useNavigate();
  const { campaigns, isLoading, error }: UseCampaignsForHomeReturn =
    useCampaignsForHome();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Funding" | "Successful" | "Failed" | "Withdrawn"
  >("All");

  const filteredCampaigns =
    activeFilter === "All"
      ? campaigns
      : campaigns.filter((c) => c.status === activeFilter);

  const handleViewDetails = (campaignAddress: string) => {
    const campaign = campaigns.find((c) => c.address === campaignAddress);
    navigate(`/campaign/${campaignAddress}`, { state: { campaign } });
  };

  // ... (error return stays the same)
```

Add `import { useState } from "react";` to the imports.

- [x] **Step 8.2: Add filter tabs UI between the section header and the campaign grid**

In the campaign grid section of HomePage, between the `<div className="mb-8">` header block and the grid, insert:
```tsx
{/* Filter Tabs */}
{!isLoading && campaigns.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-6">
    {(["All", "Funding", "Successful", "Failed", "Withdrawn"] as const).map(
      (filter) => {
        const count =
          filter === "All"
            ? campaigns.length
            : campaigns.filter((c) => c.status === filter).length;
        return (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${
              activeFilter === filter
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
            }`}
          >
            {filter}
            <span className="ml-1.5 text-xs opacity-70">({count})</span>
          </button>
        );
      }
    )}
  </div>
)}
```

Also update the grid to use `filteredCampaigns` instead of `campaigns`:
```tsx
// Change this:
{campaigns.map((campaign) => (
// To this:
{filteredCampaigns.map((campaign) => (
```

And add an empty state for when filter yields no results:
```tsx
// After the grid, or as the grid's else:
} : filteredCampaigns.length === 0 && activeFilter !== "All" ? (
  <div className="text-center py-16">
    <p className="text-slate-400 text-lg mb-2">No {activeFilter} campaigns</p>
    <button
      onClick={() => setActiveFilter("All")}
      className="text-sm text-blue-400 hover:text-blue-300"
    >
      Show all campaigns
    </button>
  </div>
) : (
```

- [x] **Step 8.3: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```

- [x] **Step 8.4: Commit**

```bash
git add crowFunding-Frontend/src/Pages/HomePage.tsx
git commit -m "feat: add status filter tabs to campaign list"
```

---

## Task 9: Confetti on Contribution Success + Share Campaign Button

**Items covered:** 13 (confetti animation), 14 (shareable campaign URL)

**Files:**
- Modify: `crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx`

Note: We implement confetti using a CSS-only approach to avoid adding a new npm package. We'll add a brief "burst" overlay using Tailwind animation instead of `react-confetti`. This keeps the bundle lean.

- [x] **Step 9.1: Add confetti state to CampaignDetailPage**

In `CampaignDetailPage.tsx`, add to the existing state declarations:
```typescript
const [showConfetti, setShowConfetti] = useState(false);
```

- [x] **Step 9.2: Trigger confetti on contribution success**

Find the existing `useEffect` for `isContributionSuccess` (around line 89–94):
```typescript
useEffect(() => {
  if (isContributionSuccess) {
    setToast({ message: "Contribution successful! 🎉", type: 'success' });
    setContributionAmount("");
    refetch();
    // Add:
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }
}, [isContributionSuccess, refetch]);
```

- [x] **Step 9.3: Add confetti overlay JSX**

Inside the returned JSX, right after the toast notification div (around line 213), add:
```tsx
{/* Confetti Burst on Contribution Success */}
{showConfetti && (
  <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="absolute animate-ping"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"][
            Math.floor(Math.random() * 5)
          ],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${0.6 + Math.random() * 0.8}s`,
        }}
      />
    ))}
  </div>
)}
```

Note: `Math.random()` in JSX render is intentional here — it runs once when `showConfetti` flips to `true` and the component re-renders, giving random particle placement per celebration.

- [x] **Step 9.4: Add Share Campaign button to CampaignDetailPage sidebar**

In the "About Campaign" sidebar card (around line 567), after the closing `</div>` of that card, add a new card:
```tsx
{/* Share Campaign Card */}
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
  <h3 className="text-lg font-semibold text-white mb-4">
    Share Campaign
  </h3>
  <p className="text-xs text-slate-400 mb-4">
    Share this campaign link with potential contributors.
  </p>
  <CopyButton
    text={window.location.href}
    className="w-full justify-center py-2 border border-slate-600 rounded-lg"
  />
</div>
```

`CopyButton` is already imported from Task 5. `window.location.href` gives the full current URL (e.g., `https://yourapp.vercel.app/campaign/0x...`), which is exactly the shareable link.

- [x] **Step 9.5: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```

- [x] **Step 9.6: Commit**

```bash
git add crowFunding-Frontend/src/Pages/CampaignDetailPage.tsx
git commit -m "feat: add confetti on contribution success and share campaign button"
```

---

## Task 10: Admin Panel for Factory Owner

**Item covered:** 15 (admin panel)

**Context:** The factory owner (deployer of `CrowdFundingFactory`) must periodically approve the factory contract to spend Karma tokens on their behalf (because `distributeTokens` uses `transferFrom(owner(), ...)`). The Admin Panel shows the current allowance, a warning if it's low, and an Approve button to top it up. Only visible to the factory owner — all other users never see this page or nav link.

**Files:**
- Create: `crowFunding-Frontend/src/hooks/useAdminPanel.ts`
- Create: `crowFunding-Frontend/src/Pages/AdminPage.tsx`
- Modify: `crowFunding-Frontend/src/components/Header.tsx`
- Modify: `crowFunding-Frontend/src/main.tsx`

- [x] **Step 10.1: Create useAdminPanel hook**

Create `crowFunding-Frontend/src/hooks/useAdminPanel.ts`:
```typescript
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import type { Address } from "viem";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../contracts/config";
import { factoryABI } from "../contracts/ABI/FactoryABI";
import karmaABI from "../contracts/Karma.json";
import type { TransactionState } from "../components/TransactionButton";

const erc20Abi = karmaABI.abi as readonly object[];

export type UseAdminPanelReturn = {
  isFactoryOwner: boolean;
  ownerAddress: Address | undefined;
  currentAllowance: bigint;
  isLoading: boolean;
  approveTokens: (amount: bigint) => void;
  txState: TransactionState;
  txHash: string | undefined;
  approveError: string | null;
};

export function useAdminPanel(): UseAdminPanelReturn {
  const { address: connectedAddress } = useAccount();

  // Batch read: factory owner + current allowance
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.factory as Address,
        abi: factoryABI,
        functionName: "owner",
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        address: CONTRACTS.token as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [connectedAddress, CONTRACTS.factory as Address],
        chainId: SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: !!connectedAddress,
      refetchInterval: 10000,
    },
  });

  const ownerAddress = data?.[0]?.result as Address | undefined;
  const currentAllowance = (data?.[1]?.result as bigint) ?? 0n;
  const isFactoryOwner =
    !!connectedAddress &&
    !!ownerAddress &&
    connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  // Approve write
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const approveTokens = (amount: bigint) => {
    writeContract({
      address: CONTRACTS.token as Address,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACTS.factory as Address, amount],
    });
  };

  const getTxState = (): TransactionState => {
    if (isSuccess) return "success";
    if (writeError) return "error";
    if (isConfirming) return "pending";
    if (isPending) return "preparing";
    return "idle";
  };

  return {
    isFactoryOwner,
    ownerAddress,
    currentAllowance,
    isLoading,
    approveTokens,
    txState: getTxState(),
    txHash,
    approveError: writeError?.message ?? null,
  };
}
```

- [x] **Step 10.2: Create AdminPage**

Create `crowFunding-Frontend/src/Pages/AdminPage.tsx`:
```tsx
import { useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { formatUnits, parseUnits } from "viem";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { useTokenInfo } from "../features/campaigns/hooks";
import TransactionButton from "../components/TransactionButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { shortenAddress } from "../utils/formatters";
import { getAddressUrl } from "../utils/etherscan";
import { CONTRACTS } from "../contracts/config";
import type { Address } from "viem";

function AdminPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const {
    isFactoryOwner,
    ownerAddress,
    currentAllowance,
    isLoading,
    approveTokens,
    txState,
    txHash,
    approveError,
  } = useAdminPanel();

  const { symbol: tokenSymbol } = useTokenInfo(CONTRACTS.token as Address);
  const [approveAmount, setApproveAmount] = useState("1000000");

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-sm">
          <p className="text-xl text-white mb-4">Connect Wallet</p>
          <p className="text-slate-400 text-sm">Connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isFactoryOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 border border-red-700/50 rounded-xl p-8 max-w-sm">
          <p className="text-2xl mb-3">🔒</p>
          <p className="text-xl text-white mb-2">Access Denied</p>
          <p className="text-slate-400 text-sm mb-4">
            This page is only accessible to the factory owner.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Allowance status classification
  const allowanceInTokens = Number(formatUnits(currentAllowance, 18));
  const getAllowanceStatus = () => {
    if (allowanceInTokens === 0) return { label: "Critical — No Allowance", color: "red" };
    if (allowanceInTokens < 1000) return { label: "Low", color: "amber" };
    return { label: "Sufficient", color: "green" };
  };
  const status = getAllowanceStatus();

  const handleApprove = () => {
    try {
      const amount = parseUnits(approveAmount, 18);
      approveTokens(amount);
    } catch {
      // Invalid input — input validation below prevents this
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Factory owner controls for token distribution</p>
        </div>

        {/* Owner Info */}
        <div className="bg-slate-800/50 border border-purple-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👑</span>
            <h2 className="text-lg font-semibold text-white">Factory Owner</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getAddressUrl(ownerAddress!)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-blue-400 hover:text-blue-300 underline"
            >
              {shortenAddress(ownerAddress!)}
            </a>
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">You</span>
          </div>
        </div>

        {/* Allowance Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Token Allowance Status</h2>
          <p className="text-xs text-slate-500 mb-4">
            The factory calls <code className="text-slate-300">transferFrom(owner, contributor, amount)</code> to distribute rewards.
            You must maintain sufficient allowance from your wallet to the factory contract.
          </p>

          <div className={`flex items-center justify-between p-4 rounded-lg mb-4 ${
            status.color === "green" ? "bg-green-500/10 border border-green-500/30" :
            status.color === "amber" ? "bg-amber-500/10 border border-amber-500/30" :
            "bg-red-500/10 border border-red-500/30"
          }`}>
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Allowance</p>
              <p className="text-xl font-bold text-white">
                {allowanceInTokens.toLocaleString()} {tokenSymbol}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
              status.color === "green" ? "text-green-400 border-green-500/30 bg-green-500/10" :
              status.color === "amber" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
              "text-red-400 border-red-500/30 bg-red-500/10"
            }`}>
              {status.label}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Approved: <span className="font-mono text-slate-300">{shortenAddress(ownerAddress!)}</span> →{" "}
            <a
              href={getAddressUrl(CONTRACTS.factory)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-400 hover:text-blue-300 underline"
            >
              Factory ({shortenAddress(CONTRACTS.factory)})
            </a>
          </p>
        </div>

        {/* Approve Form */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Approve Tokens</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount to Approve ({tokenSymbol})
            </label>
            <div className="relative">
              <input
                type="number"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                min="1"
                step="1000"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {tokenSymbol}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Recommended: enough to cover all active campaigns' potential rewards.
            </p>
          </div>

          <TransactionButton
            onClick={handleApprove}
            label={`Approve ${Number(approveAmount).toLocaleString()} ${tokenSymbol}`}
            txState={txState}
            txHash={txHash}
            error={approveError}
            disabled={!approveAmount || Number(approveAmount) <= 0}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
```

- [x] **Step 10.3: Add Admin route to main.tsx**

In `crowFunding-Frontend/src/main.tsx`, add the import and route:
```typescript
// Add import:
import AdminPage from "./Pages/AdminPage.tsx";

// Add route inside the <Route path="/" element={<Layout>}> group:
<Route path="admin" element={<AdminPage />} />
```

- [x] **Step 10.4: Add conditional Admin link to Header**

In `crowFunding-Frontend/src/components/Header.tsx`, make the Admin nav link visible only to the factory owner.

Add imports:
```typescript
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "../contracts/config";
import { factoryABI } from "../contracts/ABI/FactoryABI";
import type { Address } from "viem";
```

Inside the `Header` function, add after the existing `useState`:
```typescript
const { address: connectedAddress, isConnected } = useAccount();

const { data: ownerAddress } = useReadContract({
  address: CONTRACTS.factory as Address,
  abi: factoryABI,
  functionName: "owner",
  chainId: SEPOLIA_CHAIN_ID,
  query: { enabled: isConnected },
});

const isFactoryOwner =
  isConnected &&
  !!ownerAddress &&
  connectedAddress?.toLowerCase() === (ownerAddress as string).toLowerCase();
```

Then in both Desktop Navigation and Mobile Navigation sections, add the Admin link conditionally after the existing nav links:
```tsx
{isFactoryOwner && (
  <NavLink
    to="/admin"
    className={({ isActive }) =>
      `text-sm font-medium transition-colors hover:text-purple-400 ${
        isActive ? "text-purple-400" : "text-slate-300"
      }`
    }
  >
    Admin ⚙️
  </NavLink>
)}
```

- [x] **Step 10.5: Verify build**

```bash
cd crowFunding-Frontend
npm run build
```
Expected: Passes with no TypeScript errors.

- [x] **Step 10.6: Commit**

```bash
git add crowFunding-Frontend/src/hooks/useAdminPanel.ts
git add crowFunding-Frontend/src/Pages/AdminPage.tsx
git add crowFunding-Frontend/src/components/Header.tsx
git add crowFunding-Frontend/src/main.tsx
git commit -m "feat: add admin panel for factory owner token allowance management"
```

---

## Task 11: Deploy to Vercel

**Files:** No code changes — deployment configuration only.

- [x] **Step 11.1: Push all changes to GitHub**

```bash
git push origin main
```

- [x] **Step 11.2: Deploy on Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `crowdFunding-Dapp` repository
3. Set **Root Directory** to `crowFunding-Frontend`
4. Under **Environment Variables**, add:
   - Key: `VITE_WALLETCONNECT_PROJECT_ID`
   - Value: `5a80fd14b88c85602c947763720f985e`
5. Click Deploy

- [x] **Step 11.3: Verify live deployment**

Once deployed, open the Vercel URL and:
- [x] Home page loads with hero + campaign grid
- [x] Wallet connects on Sepolia
- [x] Campaign detail page loads with real token symbol
- [x] Create campaign flow works end-to-end
- [x] Footer shows with correct Etherscan links
- [x] Copy buttons work
- [x] Etherscan address/tx links open correctly

- [x] **Step 11.4: Update README with live URL**

In `README.md`, add the live Vercel URL to the Getting Started section.

```bash
git add README.md
git commit -m "docs: add live deployment URL"
git push origin main
```

---

## Self-Review: Spec Coverage Check

| Item | Task | Covered |
|------|------|---------|
| 1. Token symbol hardcoded | Task 3 + 4 | ✅ |
| 2. Token address per campaign | Task 3 (factory-wide — no type change needed) | ✅ |
| 3. canFinalize locked to creator | Task 4 Step 4.3 | ✅ |
| 4. Tx hash not linked to Etherscan | Task 5 Step 5.1 | ✅ |
| 5. Hero section with stats | Task 7 | ✅ |
| 6. Copy-to-clipboard | Task 2 + 5 | ✅ |
| 7. How It Works section | Task 7 | ✅ |
| 8. Status filter tabs | Task 8 | ✅ |
| 9. Etherscan address links | Task 2 + 5 | ✅ |
| 10. Footer | Task 6 | ✅ |
| 11. Global stats (EXCLUDED) | — | — |
| 12. Real-time events (EXCLUDED) | — | — |
| 13. Confetti on contribution | Task 9 | ✅ |
| 14. Share campaign URL | Task 9 | ✅ |
| 15. Admin panel | Task 10 | ✅ |
| 16. Remove console.logs | Task 1 | ✅ |
| 17. WalletConnect projectId to env | Task 1 | ✅ |
| 18. Remove unused import main.tsx | Task 1 | ✅ |
| 19. Clean up App.tsx | Task 1 | ✅ |
| 20. Fix README placeholder | Task 1 | ✅ |
| Deployment | Task 11 | ✅ |

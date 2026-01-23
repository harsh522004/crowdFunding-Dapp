## Notes from Testing on Etherscan (Step 1.4)

During **Step 1.4 (testing on Etherscan)**, I made several mistakes that helped me understand ERC-20 tokens more deeply. Most of the issues came from two conceptual misunderstandings, which repeatedly caused a **"transaction gas limit too high"** error on Etherscan.

Below is a clarification of both issues and the lessons learned.

---

## 1\. Confusion About ERC-20 Input Parameters (Decimals)

ERC-20 tokens have an `approve` function that allows a spender to transfer tokens on behalf of the token owner.

While approving the allowance, I mistakenly entered values like `100` or `1000` directly as the amount. I forgot that ERC-20 tokens typically use **18 decimals**, which means the actual value should be multiplied by `10^18`.

Because of this mistake, I was effectively allowing the contract to spend only:

`0.000000000000001 tokens`

However, my campaign contract calculates token rewards using the following logic:

`uint256 tokenReward =
    ((msg.value * 10**18) * rewardRate) / 1 ether;`

This calculated `tokenReward` was **much larger** than the approved allowance, which caused the transaction to fail.

### Learning

Always think carefully about how input values are interpreted, especially when working with token decimals.

---

## 2\. Misunderstanding the Token Reward Flow in the Contract

I followed the steps below to test campaign contributions:

1.  Deploy the **Token contract** from the **Admin** wallet

2.  Deploy the **Master contract** from the **Admin** wallet

3.  Deploy the **Factory contract** (passing the Master contract) from the **Admin** wallet

4.  Create a new **Campaign** from the **Test User** wallet
    - The campaign owner is now the **Test User**

5.  Approve token spending for the newly created campaign from the **Test User** wallet (**mistake here**)

6.  When someone contributes, the following code executes:

`token.transferFrom(owner(), msg.sender, tokenReward);`

In this logic, the campaign attempts to transfer tokens **from the owner's wallet to the contributor**.

The problem is that the **owner is the Test User**, and the Test User does **not own any tokens**. All tokens were minted to the Admin wallet.

As a result, the transfer always fails.

---

## Final Takeaway

Most of the issues were not code bugs but **misunderstandings of ERC-20 behavior and contract flow**. Testing on Etherscan made these problems very visible and helped clarify how approvals, ownership, and token transfers actually work.

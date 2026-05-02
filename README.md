# 🔐 ShadowVault — Confidential Finance on Ethereum

> **Zama Developer Program — Mainnet Season 2 | Builder Track**

> The first fully private DeFi vault with FHE credit scoring and selective disclosure proofs.

🌐 **Live Demo:** [shadowvault-6jkr.vercel.app](https://shadowvault-6jkr.vercel.app) 
📄 **Contract:** [0x47CC415AC24ca796a6f8E1cbDAEC319FD70AF844](https://sepolia.etherscan.io/address/0x47CC415AC24ca796a6f8E1cbDAEC319FD70AF844)  
🎥 **Video Demo:** [Link coming soon]

---

## 🧠 What is ShadowVault?

On regular blockchains, **everything is public**. Anyone can see:
- How much crypto you hold
- Your transaction history
- Whether you qualify for a loan

**ShadowVault fixes this.**

Using **Zama's Fully Homomorphic Encryption (FHE)**, ShadowVault lets you:
- Store funds that **nobody can see** — not even the blockchain
- Get a **credit score** computed on your private data
- **Prove financial facts** (e.g. "I have enough") without revealing your actual numbers

Think of it like this:
> 🏦 "I can prove I have more than $500 in my account — without showing you my bank statement."

---

## 🔄 The Product Loop

┌─────────────────────────────────────────────────┐
│                                                   │
│   Deposit Privately                               │
│        ↓                                         │
│   Vault Activity → FHE Credit Score Generated    │
│        ↓                                         │
│   Score → Unlocks Loan Eligibility Proofs         │
│        ↓                                         │
│   Prove Facts Without Revealing Anything          │
│                                                   │
└─────────────────────────────────────────────────┘

This is a **complete financial loop** — not just a demo. It's a product.

---

## ✨ Features

### 🏦 1. Private Vault
- Deposit any amount — encrypted locally before hitting the chain
- Nobody sees your balance. Ever.
- Withdraw safely — FHE checks if you have enough without revealing your balance
- **5% APY yield** accrued entirely on encrypted values

### ⭐ 2. Shadow Score (FHE Credit Score)
- Submit encrypted income + encrypted debt
- Smart contract computes your score **without seeing your raw data**
- Score range: 300–800 (like a real credit score)
- Formula runs 100% inside FHE — zero data exposure

### 📋 3. Selective Disclosure Proofs
- **proveScoreAbove(threshold)** — "My score is above 600" ✓ or ✗
- **proveLoanEligibility(amount)** — "I qualify for this loan" ✓ or ✗  
- **proveBalanceAbove(threshold)** — "I have enough funds" ✓ or ✗
- Returns encrypted `ebool` — verifiable on-chain, reveals nothing

---

## 🔧 FHE Operations Showcased

| Feature | FHE Operation | What It Does |
|---|---|---|
| Private deposit | `FHE.add(balance, encAmt)` | Adds encrypted amounts |
| Safe withdrawal | `FHE.ge()` + `FHE.select()` | Checks balance privately |
| Score computation | `FHE.mul()` + `FHE.div()` | Math on encrypted numbers |
| Score capping | `FHE.select(overMax, 800, rawScore)` | Conditional without revealing |
| Proof generation | `FHE.ge(score, threshold)` | Returns encrypted boolean |
| Yield accrual | `FHE.mul()` + `FHE.div()` | APY on encrypted balance |

Every core FHE operation is used naturally — not forced.

---

## 🚀 Deployment

| Item | Details |
|---|---|
| Network | Sepolia Testnet |
| Contract Address | `0x47CC415AC24ca796a6f8E1cbDAEC319FD70AF844` |
| Frontend | Vercel |
| FHE Library | `@fhevm/solidity` by Zama |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.28 + Zama FHEVM |
| Encryption | `@fhevm/solidity` — FHE.add, FHE.mul, FHE.div, FHE.select |
| Access Control | OpenZeppelin Ownable + ReentrancyGuard |
| Frontend | React + TypeScript + Vite |
| Wallet | MetaMask + ethers.js v5 |
| Deployment | Hardhat + Sepolia Testnet |
| Hosting | Vercel |

---

## 📦 Run Locally

```bash
# 1. Clone
git clone https://github.com/0xkinno/shadowvault
cd shadowvault

# 2. Install
npm install --legacy-peer-deps

# 3. Set up environment
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL

# 4. Compile & Deploy
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia

# 5. Run Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## 🔐 How FHE Works Here (Simple Version)

Normal blockchain:   balance = 1000        ← everyone sees this
ShadowVault:         balance = [encrypted] ← nobody sees this
The contract can still do:
encrypted_balance + encrypted_deposit = new_encrypted_balance
Without ever knowing what the actual numbers are.
This is Fully Homomorphic Encryption.

---

## 👤 Author

**0xkinno**  
Built for Zama Developer Program Season 2 — Builder Track  
[GitHub](https://github.com/0xkinno) 

---

## 📜 License

BSD-3-Clause-Clear

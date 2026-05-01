// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ShadowVault is ZamaEthereumConfig, Ownable, ReentrancyGuard {

    mapping(address => euint64) private _balance;
    mapping(address => euint64) private _score;
    mapping(address => bool)    public  hasDeposited;
    mapping(address => bool)    public  hasProfile;

    uint256 public totalUsers;
    uint256 public totalTransactions;
    uint256 public apyBps = 500;
    uint256 public lastYieldTime;

    event Deposited(address indexed user, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint256 timestamp);
    event ProofGenerated(address indexed user, string proofType, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        lastYieldTime = block.timestamp;
    }

    // ── 1. PRIVATE VAULT ──────────────────────────────────────────────────

    function deposit(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external nonReentrant {
        euint64 encAmt = FHE.fromExternal(encryptedAmount, inputProof);

        if (!hasDeposited[msg.sender]) {
            _balance[msg.sender] = encAmt;
            hasDeposited[msg.sender] = true;
            totalUsers++;
        } else {
            _balance[msg.sender] = FHE.add(_balance[msg.sender], encAmt);
        }

        FHE.allowThis(_balance[msg.sender]);
        FHE.allow(_balance[msg.sender], msg.sender);

        totalTransactions++;
        emit Deposited(msg.sender, block.timestamp);
    }

    function withdraw(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external nonReentrant {
        require(hasDeposited[msg.sender], "No vault found");

        euint64 encAmt = FHE.fromExternal(encryptedAmount, inputProof);

        ebool sufficient = FHE.ge(_balance[msg.sender], encAmt);

        _balance[msg.sender] = FHE.select(
            sufficient,
            FHE.sub(_balance[msg.sender], encAmt),
            _balance[msg.sender]
        );

        FHE.allowThis(_balance[msg.sender]);
        FHE.allow(_balance[msg.sender], msg.sender);

        totalTransactions++;
        emit Withdrawn(msg.sender, block.timestamp);
    }

    function accrueYield(address[] calldata users) external onlyOwner {
        uint256 elapsed = block.timestamp - lastYieldTime;
        uint256 yieldPer10k = (apyBps * elapsed) / 31536000;
        if (yieldPer10k == 0) return;

        for (uint256 i = 0; i < users.length; i++) {
            if (!hasDeposited[users[i]]) continue;
            euint64 yieldAmt = FHE.div(
                FHE.mul(_balance[users[i]], uint64(yieldPer10k)),
                uint64(10000)
            );
            _balance[users[i]] = FHE.add(_balance[users[i]], yieldAmt);
            FHE.allowThis(_balance[users[i]]);
            FHE.allow(_balance[users[i]], users[i]);
        }
        lastYieldTime = block.timestamp;
    }

    // ── 2. SHADOW SCORE ───────────────────────────────────────────────────
    //
    // Score formula (FHE-safe, no encrypted divisor):
    //
    //   incomeWeight  = income * 600        (max contribution: 600 pts)
    //   debtPenalty   = debt   * 300        (capped via select at 300 pts)
    //   rawScore      = 300 + (incomeWeight / 1000) - (debtPenalty / 1000)
    //
    // All divisions use plaintext denominators — fully supported by FHEVM.
    // Score is clamped [300, 800].

    function computeScore(
        externalEuint64 encryptedIncome,
        bytes calldata incomeProof,
        externalEuint64 encryptedDebt,
        bytes calldata debtProof
    ) external {
        euint64 encIncome = FHE.fromExternal(encryptedIncome, incomeProof);
        euint64 encDebt   = FHE.fromExternal(encryptedDebt,   debtProof);

        // Income contribution: up to +500 points
        // (income * 500) / 1000  =  income / 2  (scaled)
        euint64 incomeContrib = FHE.div(FHE.mul(encIncome, uint64(500)), uint64(1000));

        // Debt penalty: up to -200 points
        euint64 debtPenaltyRaw = FHE.div(FHE.mul(encDebt, uint64(200)), uint64(1000));

        // Cap income contribution at 500
        ebool incomeOver = FHE.gt(incomeContrib, uint64(500));
        euint64 incomeContribCapped = FHE.select(incomeOver, FHE.asEuint64(uint64(500)), incomeContrib);

        // Cap debt penalty at 200
        ebool debtOver = FHE.gt(debtPenaltyRaw, uint64(200));
        euint64 debtPenaltyCapped = FHE.select(debtOver, FHE.asEuint64(uint64(200)), debtPenaltyRaw);

        // Base score 300 + income contribution
        euint64 withIncome = FHE.add(FHE.asEuint64(uint64(300)), incomeContribCapped);

        // Subtract debt penalty safely: if penalty > withIncome, floor at 300
        ebool canSubtract = FHE.ge(withIncome, debtPenaltyCapped);
        euint64 rawScore = FHE.select(
            canSubtract,
            FHE.sub(withIncome, debtPenaltyCapped),
            FHE.asEuint64(uint64(300))
        );

        // Cap at 800
        ebool overMax = FHE.gt(rawScore, uint64(800));
        _score[msg.sender] = FHE.select(overMax, FHE.asEuint64(uint64(800)), rawScore);

        FHE.allowThis(_score[msg.sender]);
        FHE.allow(_score[msg.sender], msg.sender);

        if (!hasProfile[msg.sender]) hasProfile[msg.sender] = true;

        emit ScoreUpdated(msg.sender, block.timestamp);
    }

    // ── 3. SELECTIVE DISCLOSURE ───────────────────────────────────────────

    function proveScoreAbove(uint64 threshold) external returns (ebool) {
        require(hasProfile[msg.sender], "No score found");

        ebool result = FHE.ge(_score[msg.sender], threshold);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ProofGenerated(msg.sender, "SCORE_ABOVE", block.timestamp);
        return result;
    }

    function proveLoanEligibility(uint64 loanAmount) external returns (ebool) {
        require(hasProfile[msg.sender], "No score found");

        uint64 requiredScore;
        if (loanAmount <= 5000)       requiredScore = 400;
        else if (loanAmount <= 10000) requiredScore = 550;
        else                          requiredScore = 700;

        ebool eligible = FHE.ge(_score[msg.sender], requiredScore);
        FHE.allowThis(eligible);
        FHE.allow(eligible, msg.sender);

        emit ProofGenerated(msg.sender, "LOAN_ELIGIBLE", block.timestamp);
        return eligible;
    }

    function proveBalanceAbove(uint64 threshold) external returns (ebool) {
        require(hasDeposited[msg.sender], "No vault found");

        ebool result = FHE.ge(_balance[msg.sender], threshold);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ProofGenerated(msg.sender, "BALANCE_ABOVE", block.timestamp);
        return result;
    }

    // ── READ ──────────────────────────────────────────────────────────────

    function getEncryptedBalance(address user) external view returns (euint64) {
        return _balance[user];
    }

    function getEncryptedScore(address user) external view returns (euint64) {
        return _score[user];
    }

    function getVaultStats() external view returns (
        uint256 users,
        uint256 transactions,
        uint256 currentApy,
        uint256 lastYield
    ) {
        return (totalUsers, totalTransactions, apyBps, lastYieldTime);
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────

    function setAPY(uint256 newApyBps) external onlyOwner {
        require(newApyBps <= 3000, "Max 30%");
        apyBps = newApyBps;
    }
}
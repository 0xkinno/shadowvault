// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ShadowVaultDemo is Ownable, ReentrancyGuard {

    mapping(address => uint64) private _balance;
    mapping(address => uint64) private _score;
    mapping(address => bool) public hasDeposited;
    mapping(address => bool) public hasProfile;

    uint256 public totalUsers;
    uint256 public totalTransactions;
    uint256 public apyBps = 500;

    event Deposited(address indexed user, uint64 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint64 amount, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint64 score, uint256 timestamp);
    event ProofGenerated(address indexed user, string proofType, bool result, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function deposit(uint64 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        if (!hasDeposited[msg.sender]) {
            _balance[msg.sender] = amount;
            hasDeposited[msg.sender] = true;
            totalUsers++;
        } else {
            _balance[msg.sender] += amount;
        }

        totalTransactions++;
        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint64 amount) external nonReentrant {
        require(hasDeposited[msg.sender], "No vault found");
        require(_balance[msg.sender] >= amount, "Insufficient balance");

        _balance[msg.sender] -= amount;
        totalTransactions++;
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    function computeScore(uint64 income, uint64 debt) external {
        uint64 incomeContrib = uint64(Math.min((income * 500) / 1000, 500));
        uint64 debtPenalty = uint64(Math.min((debt * 200) / 1000, 200));
        uint64 raw = 300 + incomeContrib;
        if (raw > debtPenalty) {
            raw -= debtPenalty;
        } else {
            raw = 300;
        }
        _score[msg.sender] = uint64(Math.min(raw, 800));

        if (!hasProfile[msg.sender]) hasProfile[msg.sender] = true;
        emit ScoreUpdated(msg.sender, _score[msg.sender], block.timestamp);
    }

    function proveScoreAbove(uint64 threshold) external returns (bool) {
        require(hasProfile[msg.sender], "No score found");
        bool result = _score[msg.sender] >= threshold;
        emit ProofGenerated(msg.sender, "SCORE_ABOVE", result, block.timestamp);
        return result;
    }

    function proveLoanEligibility(uint64 loanAmount) external returns (bool) {
        require(hasProfile[msg.sender], "No score found");
        uint64 requiredScore;
        if (loanAmount <= 5000) requiredScore = 400;
        else if (loanAmount <= 10000) requiredScore = 550;
        else requiredScore = 700;

        bool eligible = _score[msg.sender] >= requiredScore;
        emit ProofGenerated(msg.sender, "LOAN_ELIGIBLE", eligible, block.timestamp);
        return eligible;
    }

    function proveBalanceAbove(uint64 threshold) external returns (bool) {
        require(hasDeposited[msg.sender], "No vault found");
        bool result = _balance[msg.sender] >= threshold;
        emit ProofGenerated(msg.sender, "BALANCE_ABOVE", result, block.timestamp);
        return result;
    }

    function getBalance(address user) external view returns (uint64) {
        return _balance[user];
    }

    function getScore(address user) external view returns (uint64) {
        return _score[user];
    }

    function getVaultStats() external view returns (
        uint256 users,
        uint256 transactions,
        uint256 currentApy
    ) {
        return (totalUsers, totalTransactions, apyBps);
    }
}

library Math {
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
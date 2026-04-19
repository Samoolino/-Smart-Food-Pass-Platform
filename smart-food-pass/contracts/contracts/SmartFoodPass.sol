// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SmartFoodPass
 * @dev Smart contract for managing programmable grocery access passes
 * @notice This is a core component of the Smart Food Pass platform
 */
contract SmartFoodPass is Ownable, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Pass structure
    struct Pass {
        uint256 id;
        address beneficiary;
        address sponsor;
        uint256 value;
        uint256 balance;
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
    }

    // Transaction structure
    struct Transaction {
        uint256 id;
        uint256 passId;
        address merchant;
        uint256 amount;
        uint256 timestamp;
        bytes32 productHash;
    }

    // State variables
    mapping(uint256 => Pass) public passes;
    mapping(uint256 => Transaction[]) public passTransactions;
    mapping(address => uint256) public merchantTotals;
    mapping(address => bool) public approvedMerchants;

    uint256 public passCounter;
    uint256 public transactionCounter;
    bool public systemPaused;

    // Events
    event PassIssued(
        uint256 indexed passId,
        address indexed beneficiary,
        address indexed sponsor,
        uint256 value
    );

    event PassFunded(
        uint256 indexed passId,
        address indexed sponsor,
        uint256 amount
    );

    event PassRedeemed(
        uint256 indexed passId,
        address indexed merchant,
        uint256 amount
    );

    event TransactionLogged(
        uint256 indexed passId,
        address indexed merchant,
        uint256 amount,
        bytes32 productHash
    );

    event MerchantValidated(address indexed merchant);
    event MerchantRevoked(address indexed merchant);
    event SystemPaused();
    event SystemResumed();

    // Modifiers
    modifier notPaused() {
        require(!systemPaused, "System is paused");
        _;
    }

    modifier onlyMerchantApproved() {
        require(approvedMerchants[msg.sender], "Merchant not approved");
        _;
    }

    /**
     * @dev Constructor - Initialize contract and set deployer as admin
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        systemPaused = false;
    }

    /**
     * @dev Issue a new pass
     * @param _beneficiary Address of beneficiary
     * @param _value Amount to fund the pass with
     * @return passId Unique pass ID
     */
    function issuePass(
        address _beneficiary,
        uint256 _value
    ) external onlyRole(SPONSOR_ROLE) notPaused returns (uint256) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_value > 0, "Value must be greater than 0");

        uint256 passId = ++passCounter;
        uint256 expiryTime = block.timestamp + (90 days);

        passes[passId] = Pass({
            id: passId,
            beneficiary: _beneficiary,
            sponsor: msg.sender,
            value: _value,
            balance: _value,
            createdAt: block.timestamp,
            expiresAt: expiryTime,
            isActive: true
        });

        emit PassIssued(passId, _beneficiary, msg.sender, _value);
        return passId;
    }

    /**
     * @dev Fund an existing pass
     * @param _passId ID of the pass to fund
     * @param _amount Amount to add
     */
    function fundPass(
        uint256 _passId,
        uint256 _amount
    ) external onlyRole(SPONSOR_ROLE) notPaused payable {
        Pass storage pass = passes[_passId];
        require(pass.id != 0, "Pass not found");
        require(pass.isActive, "Pass is not active");
        require(block.timestamp < pass.expiresAt, "Pass has expired");
        require(_amount > 0, "Amount must be greater than 0");

        pass.value += _amount;
        pass.balance += _amount;

        emit PassFunded(_passId, msg.sender, _amount);
    }

    /**
     * @dev Redeem a pass
     * @param _passId ID of pass to redeem
     * @param _amount Amount to redeem
     * @return success Whether redemption was successful
     */
    function redeemPass(
        uint256 _passId,
        uint256 _amount
    ) external onlyMerchantApproved notPaused nonReentrant returns (bool) {
        Pass storage pass = passes[_passId];
        require(pass.id != 0, "Pass not found");
        require(pass.isActive, "Pass is not active");
        require(block.timestamp < pass.expiresAt, "Pass has expired");
        require(pass.balance >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount must be greater than 0");

        pass.balance -= _amount;
        merchantTotals[msg.sender] += _amount;

        emit PassRedeemed(_passId, msg.sender, _amount);
        return true;
    }

    /**
     * @dev Log a transaction on-chain
     * @param _passId ID of pass
     * @param _merchant Address of merchant
     * @param _amount Transaction amount
     * @param _productHash Hash of product purchased
     */
    function logTransaction(
        uint256 _passId,
        address _merchant,
        uint256 _amount,
        bytes32 _productHash
    ) external onlyRole(ADMIN_ROLE) {
        uint256 txId = ++transactionCounter;

        Transaction memory tx = Transaction({
            id: txId,
            passId: _passId,
            merchant: _merchant,
            amount: _amount,
            timestamp: block.timestamp,
            productHash: _productHash
        });

        passTransactions[_passId].push(tx);

        emit TransactionLogged(_passId, _merchant, _amount, _productHash);
    }

    /**
     * @dev Validate a merchant
     * @param _merchant Address to validate
     */
    function validateMerchant(
        address _merchant
    ) external onlyRole(ADMIN_ROLE) {
        require(_merchant != address(0), "Invalid merchant address");
        approvedMerchants[_merchant] = true;
        _grantRole(MERCHANT_ROLE, _merchant);

        emit MerchantValidated(_merchant);
    }

    /**
     * @dev Revoke merchant approval
     * @param _merchant Address to revoke
     */
    function revokeMerchant(
        address _merchant
    ) external onlyRole(ADMIN_ROLE) {
        approvedMerchants[_merchant] = false;
        _revokeRole(MERCHANT_ROLE, _merchant);

        emit MerchantRevoked(_merchant);
    }

    /**
     * @dev Expire a pass
     * @param _passId ID of pass to expire
     */
    function expirePass(
        uint256 _passId
    ) external onlyRole(ADMIN_ROLE) {
        Pass storage pass = passes[_passId];
        require(pass.id != 0, "Pass not found");
        pass.isActive = false;
    }

    /**
     * @dev Pause the system
     */
    function pauseSystem() external onlyRole(ADMIN_ROLE) {
        systemPaused = true;
        emit SystemPaused();
    }

    /**
     * @dev Resume the system
     */
    function resumeSystem() external onlyRole(ADMIN_ROLE) {
        systemPaused = false;
        emit SystemResumed();
    }

    // Query functions

    /**
     * @dev Get pass details
     * @param _passId ID of pass
     * @return Pass structure
     */
    function getPass(
        uint256 _passId
    ) external view returns (Pass memory) {
        require(passes[_passId].id != 0, "Pass not found");
        return passes[_passId];
    }

    /**
     * @dev Get pass balance
     * @param _passId ID of pass
     * @return Current balance
     */
    function getPassBalance(uint256 _passId) external view returns (uint256) {
        require(passes[_passId].id != 0, "Pass not found");
        return passes[_passId].balance;
    }

    /**
     * @dev Get merchant total
     * @param _merchant Address of merchant
     * @return Total amount redeemed
     */
    function getMerchantTotal(
        address _merchant
    ) external view returns (uint256) {
        return merchantTotals[_merchant];
    }

    /**
     * @dev Get transaction count
     * @return Total transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactionCounter;
    }

    /**
     * @dev Get pass transactions
     * @param _passId ID of pass
     * @return Array of transactions
     */
    function getPassTransactions(
        uint256 _passId
    ) external view returns (Transaction[] memory) {
        return passTransactions[_passId];
    }
}
